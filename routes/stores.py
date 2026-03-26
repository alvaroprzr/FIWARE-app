"""
Blueprint: stores.py
CRUD operations and views for Store entities, including inventory management.
"""

import logging
import uuid
from flask import Blueprint, render_template, request, jsonify
from modules import orion
from modules import context_providers

logger = logging.getLogger(__name__)

bp = Blueprint('stores', __name__, url_prefix='')

SHELF_GRID_COLUMNS = 4
SHELF_GRID_LEVELS = 4
SHELF_GRID_DEPTH = 2
SHELF_ABSOLUTE_CAPACITY = SHELF_GRID_COLUMNS * SHELF_GRID_LEVELS * SHELF_GRID_DEPTH


def _normalize_urn(entity_id: str, entity_type: str) -> str:
    """
    Normalize plain IDs to NGSI-LD URN format.
    """
    if not entity_id:
        return ''
    if entity_id.startswith('urn:'):
        return entity_id
    return f"urn:ngsi-ld:{entity_type}:{entity_id}"


def _safe_number(value, default: int = 0) -> int:
    """
    Convert values from NGSI attributes to int safely.
    """
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _get_shelf_units(shelf_id: str) -> int:
    """
    Return total physical units currently placed in a shelf.
    """
    items = orion.get_entities(entity_type='InventoryItem', query=f"refShelf=='{shelf_id}'")
    return sum(_safe_number(item.get('shelfCount', {}).get('value'), 0) for item in items)


def _is_valid_store_id(store_id: str) -> bool:
    return isinstance(store_id, str) and store_id.startswith('urn:ngsi-ld:Store:') and bool(store_id.split(':')[-1])


def _is_project_store_id(store_id: str) -> bool:
    """
    Keep application stores and exclude tutorial numeric IDs (Store:001..).
    """
    if not _is_valid_store_id(store_id):
        return False
    suffix = store_id.split(':')[-1]
    return not suffix.isdigit()


def _has_valid_store_name(store: dict) -> bool:
    name_attr = store.get('name')
    if not isinstance(name_attr, dict):
        return False
    name_value = name_attr.get('value')
    return isinstance(name_value, str) and bool(name_value.strip())


def _cleanup_invalid_stores(stores: list) -> None:
    """Delete clearly invalid Store entities from Orion to avoid phantom rows."""
    for store in stores:
        store_id = store.get('id')
        invalid_id = not _is_valid_store_id(store_id)
        missing_name = not _has_valid_store_name(store)
        if invalid_id or missing_name:
            if store_id:
                deleted = orion.delete_entity(store_id)
                if deleted:
                    logger.info("Deleted invalid Store entity: %s", store_id)
                else:
                    logger.warning("Could not delete invalid Store entity: %s", store_id)

# ============================================================================
# GET /stores - List all stores
# ============================================================================

@bp.route('/stores', methods=['GET'])
def list_stores():
    """
    Render stores list page with maps and inventory overview.
    """
    try:
        stores = orion.get_entities(entity_type='Store', limit=1000)

        # Clean invalid stores and keep only valid rows in the UI.
        _cleanup_invalid_stores(stores)
        stores = [
            store for store in stores
            if _is_project_store_id(store.get('id')) and _has_valid_store_name(store)
        ]
        
        # Get shelf count for each store
        for store in stores:
            store_id = store.get('id')

            # Enrich list rows with external provider attrs when Orion omits them.
            missing_external_attrs = any(
                attr_name not in store or store.get(attr_name, {}).get('value') is None
                for attr_name in ('temperature', 'relativeHumidity', 'tweets')
            )
            if missing_external_attrs:
                external_attrs = context_providers.get_external_store_attrs(store_id)
                for attr_name in ('temperature', 'relativeHumidity', 'tweets'):
                    if external_attrs.get(attr_name):
                        store[attr_name] = external_attrs[attr_name]

            shelves = orion.get_entities(
                entity_type='Shelf',
                query=f"refStore=='{store_id}'"
            )
            store['shelf_count'] = len(shelves)
        
        return render_template('stores.html', stores=stores)
    except Exception as e:
        logger.exception("Error listing stores")
        return render_template('stores.html', stores=[], error=str(e))

# ============================================================================
# GET /stores/new - Create store form
# ============================================================================

@bp.route('/stores/new', methods=['GET'])
def new_store():
    """
    GET /stores/new - Show form to create new store.
    """
    return render_template('store_form.html')

# ============================================================================
# GET /stores/<store_id> - Store detail page
# ============================================================================

@bp.route('/stores/<store_id>', methods=['GET'])
def store_detail(store_id):
    """
    Render detailed view of a store.
    Includes:
    - Store information, address, contact
    - Temperature/Humidity (provider attributes)
    - Shelves and inventory distribution
    - Employees assigned to store
    - Tweets (provider attribute)
    - Map with store location (Leaflet)
    - 3D visualization of shelves (Three.js)
    """
    try:
        store_id = _normalize_urn(store_id, 'Store')
        
        # Get store with context provider attributes (temperature, humidity)
        store = orion.get_entity(
            store_id,
            include_attrs='name,address,telephone,capacity,countryCode,url,description,image,location,temperature,relativeHumidity,tweets'
        )
        if not store:
            return render_template('error.html',
                                 error='Almacén no encontrado'), 404
        
        # Orion may omit provider attrs on some query patterns; enrich from tutorial provider when needed.
        missing_external_attrs = any(
            attr_name not in store or store.get(attr_name, {}).get('value') is None
            for attr_name in ('temperature', 'relativeHumidity', 'tweets')
        )
        if missing_external_attrs:
            external_attrs = context_providers.get_external_store_attrs(store_id)
            for attr_name in ('temperature', 'relativeHumidity', 'tweets'):
                if external_attrs.get(attr_name):
                    store[attr_name] = external_attrs[attr_name]

        # Log retrieved attributes for debugging
        logger.info(f"Store {store_id}: temperature={store.get('temperature')}, humidity={store.get('relativeHumidity')}")
        
        # Get shelves in this store
        shelves = orion.get_entities(
            entity_type='Shelf',
            query=f"refStore=='{store_id}'"
        )
        
        # Get employees in this store
        employees = orion.get_entities(
            entity_type='Employee',
            query=f"refStore=='{store_id}'"
        )
        
        # Get all inventory items for this store
        inventory_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refStore=='{store_id}'"
        )
        
        # Build inventory structure by shelf
        inventory_by_shelf = {}
        product_total_stock = {}
        for item in inventory_items:
            shelf_id = item.get('refShelf', {}).get('value', 'Unknown')
            product_id = item.get('refProduct', {}).get('value')
            shelf_count = _safe_number(item.get('shelfCount', {}).get('value', 0), 0)
            if shelf_id not in inventory_by_shelf:
                inventory_by_shelf[shelf_id] = []
            if product_id:
                product_total_stock[product_id] = product_total_stock.get(product_id, 0) + shelf_count
            inventory_by_shelf[shelf_id].append(item)

        for item in inventory_items:
            product_id = item.get('refProduct', {}).get('value')
            item['displayStockCount'] = product_total_stock.get(product_id, 0) if product_id else 0
        
        # Calculate dynamic numberOfItems and capacity for each shelf
        for shelf in shelves:
            shelf_id = shelf.get('id')
            items_in_shelf = inventory_by_shelf.get(shelf_id, [])

            # Calculate actual units in shelf as SUM(shelfCount) across InventoryItems
            shelf_units = sum(
                _safe_number(item.get('shelfCount', {}).get('value', 0), 0)
                for item in items_in_shelf
            )
            shelf['calculated_item_count'] = shelf_units

            # Calculate capacity fill percentage
            max_capacity = _safe_number(shelf.get('maxCapacity', {}).get('value', 0), 0)
            fill_percent = int((shelf_units / max_capacity) * 100) if max_capacity > 0 else 0

            # Determine capacity status: low (0-50%), medium (50-80%), high (80-100%)
            if fill_percent < 50:
                capacity_status = 'low'
            elif fill_percent < 80:
                capacity_status = 'medium'
            else:
                capacity_status = 'high'

            shelf['capacity_fill'] = {
                'percent': min(fill_percent, 100),
                'status': capacity_status
            }
        
        # Extract unique product IDs from inventory items
        product_ids = set()
        for item in inventory_items:
            ref_product = item.get('refProduct', {}).get('value')
            if ref_product:
                product_ids.add(ref_product)
        
        # Fetch Product entities from Orion
        products = []
        if product_ids:
            # Orion query API does not support robust OR chains for many IDs,
            # so fetch catalog once and keep only products referenced in store inventory.
            all_products = orion.get_entities(entity_type='Product', limit=1000)
            products = [
                product for product in all_products
                if product.get('id') in product_ids
            ]
        
        # Create products dictionary keyed by ID for quick lookup
        products_dict = {}
        for product in products:
            product_id = product.get('id')
            if product_id:
                products_dict[product_id] = product
        
        return render_template('store_detail.html',
                             store=store,
                             shelves=shelves,
                             employees=employees,
                             inventory_items=inventory_items,
                             inventory_by_shelf=inventory_by_shelf,
                             products_dict=products_dict)
    except Exception as e:
        logger.error(f"Error fetching store detail: {e}")
        return render_template('error.html', error=str(e)), 500

# ============================================================================
# GET /stores/<store_id>/edit - Edit store form
# ============================================================================

@bp.route('/stores/<store_id>/edit', methods=['GET'])
def edit_store_form(store_id):
    """
    GET /stores/<store_id>/edit - Show form to edit store.
    """
    try:
        if not store_id.startswith('urn:'):
            store_id = f"urn:ngsi-ld:Store:{store_id}"
        
        store = orion.get_entity(store_id)
        if not store:
            return render_template('error.html',
                                 error='Almacén no encontrado'), 404
        
        return render_template('store_form.html', store=store)
    except Exception as e:
        logger.error(f"Error fetching store for edit: {e}")
        return render_template('error.html', error=str(e)), 500

# ============================================================================
# GET /stores/<store_id>/shelves - Shelves in store
# ============================================================================

@bp.route('/api/stores/<store_id>/shelves', methods=['GET'])
def get_store_shelves(store_id):
    """
    API endpoint returning all shelves in a store.
    """
    try:
        store_id = _normalize_urn(store_id, 'Store')
        
        shelves = orion.get_entities(
            entity_type='Shelf',
            query=f"refStore=='{store_id}'"
        )
        
        return {'shelves': shelves}, 200
    except Exception as e:
        logger.error(f"Error fetching shelves: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /api/shelves/<shelf_id>/available-products - Products not in shelf
# ============================================================================

@bp.route('/api/shelves/<shelf_id>/available-products', methods=['GET'])
def get_available_products_for_shelf(shelf_id):
    """
    API endpoint returning all products NOT yet in a specific shelf.
    Useful for UI forms to add new products to a shelf.
    
    Returns products that don't have an InventoryItem entry for this shelf.
    """
    try:
        shelf_id = _normalize_urn(shelf_id, 'Shelf')
        
        # Get all products
        all_products = orion.get_entities(entity_type='Product')
        
        # Get inventory items for this shelf
        shelf_inventory = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refShelf=='{shelf_id}'"
        )
        
        # Extract product IDs already in this shelf
        products_in_shelf = set(
            item.get('refProduct', {}).get('value')
            for item in shelf_inventory
        )
        
        # Filter products not in shelf
        available_products = [
            prod for prod in all_products
            if prod.get('id') not in products_in_shelf
        ]
        
        return {'available_products': available_products}, 200
    except Exception as e:
        logger.error(f"Error fetching available products: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /api/stores/<store_id>/available-shelves/<product_id>
# ============================================================================

@bp.route('/api/stores/<store_id>/available-shelves/<product_id>', 
         methods=['GET'])
def get_available_shelves(store_id, product_id):
    """
    API endpoint returning all shelves in a store NOT containing a product.
    Useful for forms to assign products to different shelves.
    """
    try:
        store_id = _normalize_urn(store_id, 'Store')
        product_id = _normalize_urn(product_id, 'Product')
        
        # Get all shelves in store
        all_shelves = orion.get_entities(
            entity_type='Shelf',
            query=f"refStore=='{store_id}'"
        )
        
        # Get inventory items in this store and filter by product in Python.
        # This avoids relying on compound q syntax differences across Orion versions.
        store_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refStore=='{store_id}'"
        )

        product_items = [
            item for item in store_items
            if item.get('refProduct', {}).get('value') == product_id
        ]
        
        # Extract shelf IDs containing this product
        shelves_with_product = set(
            item.get('refShelf', {}).get('value')
            for item in product_items
        )
        
        # Filter shelves without this product
        available_shelves = [
            shelf for shelf in all_shelves
            if shelf.get('id') not in shelves_with_product
        ]
        
        return {'available_shelves': available_shelves}, 200
    except Exception as e:
        logger.error(f"Error fetching available shelves: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /stores/map - Global stores map
# ============================================================================

@bp.route('/stores/map', methods=['GET'])
def stores_map():
    """
    Render a page with a global Leaflet map showing all stores.
    """
    try:
        stores = orion.get_entities(entity_type='Store', limit=1000)
        stores = [store for store in stores if _is_project_store_id(store.get('id'))]
        return render_template('stores_map.html', stores=stores)
    except Exception as e:
        logger.error(f"Error rendering map: {e}")
        return render_template('stores_map.html', stores=[], error=str(e))

# ============================================================================
# POST /api/stores/<store_id>/shelves - Create shelf in store
# ============================================================================

@bp.route('/api/stores/<store_id>/shelves', methods=['POST'])
def create_store_shelf(store_id):
    """
    API endpoint to create a Shelf in a given Store.
    Body: {name, maxCapacity, id?}
    """
    try:
        store_id = _normalize_urn(store_id, 'Store')
        data = request.get_json() or {}

        name = (data.get('name') or '').strip()
        max_capacity = _safe_number(data.get('maxCapacity'), 0)

        if not name:
            return {'error': 'Shelf name is required'}, 400
        if max_capacity <= 0:
            return {'error': 'maxCapacity must be greater than 0'}, 400
        if max_capacity > SHELF_ABSOLUTE_CAPACITY:
            return {
                'error': f'maxCapacity cannot exceed physical shelf limit ({SHELF_ABSOLUTE_CAPACITY})',
                'errorCode': 'SHELF_MAX_CAPACITY_ABSOLUTE_EXCEEDED',
                'details': {
                    'maximumAllowed': SHELF_ABSOLUTE_CAPACITY,
                    'requested': max_capacity
                }
            }, 400

        store = orion.get_entity(store_id)
        if not store:
            return {'error': 'Store not found'}, 404

        shelf_id = data.get('id')
        if shelf_id:
            shelf_id = _normalize_urn(shelf_id, 'Shelf')
        else:
            short_name = '-'.join(name.lower().split()) or 'shelf'
            shelf_id = f"urn:ngsi-ld:Shelf:{short_name}-{uuid.uuid4().hex[:8]}"

        shelf = {
            'id': shelf_id,
            'type': 'Shelf',
            'name': orion.build_attr(name, 'Text'),
            'maxCapacity': orion.build_attr(max_capacity, 'Number'),
            'numberOfItems': orion.build_attr(0, 'Number'),
            'refStore': orion.build_attr(store_id, 'Relationship')
        }

        success = orion.create_entity(shelf)
        if not success:
            return {'error': 'Could not create shelf in Orion'}, 400

        return {'success': True, 'shelf': shelf}, 201
    except Exception as e:
        logger.error(f"Error creating shelf: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# PATCH /api/shelves/<shelf_id> - Update shelf
# ============================================================================

@bp.route('/api/shelves/<shelf_id>', methods=['PATCH'])
def update_shelf(shelf_id):
    """
    API endpoint to update shelf attributes.
    Body: {name?, maxCapacity?}
    """
    try:
        shelf_id = _normalize_urn(shelf_id, 'Shelf')
        data = request.get_json() or {}

        shelf = orion.get_entity(shelf_id)
        if not shelf:
            return {'error': 'Shelf not found'}, 404

        attrs = {}
        if 'name' in data:
            name = (data.get('name') or '').strip()
            if not name:
                return {'error': 'Shelf name cannot be empty'}, 400
            attrs['name'] = orion.build_attr(name, 'Text')

        if 'maxCapacity' in data:
            max_capacity = _safe_number(data.get('maxCapacity'), 0)
            if max_capacity <= 0:
                return {'error': 'maxCapacity must be greater than 0'}, 400
            if max_capacity > SHELF_ABSOLUTE_CAPACITY:
                return {
                    'error': f'maxCapacity cannot exceed physical shelf limit ({SHELF_ABSOLUTE_CAPACITY})',
                    'errorCode': 'SHELF_MAX_CAPACITY_ABSOLUTE_EXCEEDED',
                    'details': {
                        'maximumAllowed': SHELF_ABSOLUTE_CAPACITY,
                        'requested': max_capacity
                    }
                }, 400

            current_units = _get_shelf_units(shelf_id)
            if max_capacity < current_units:
                return {
                    'error': 'maxCapacity cannot be lower than current shelf occupancy',
                    'errorCode': 'SHELF_MAX_CAPACITY_BELOW_OCCUPANCY',
                    'details': {
                        'current': current_units,
                        'requested': max_capacity
                    }
                }, 400
            attrs['maxCapacity'] = orion.build_attr(max_capacity, 'Number')

        if not attrs:
            return {'error': 'No attributes to update'}, 400

        success = orion.update_entity_attributes(shelf_id, attrs)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error updating shelf {shelf_id}: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# POST /api/shelves/<shelf_id>/inventory-items - Add product to shelf
# ============================================================================

@bp.route('/api/shelves/<shelf_id>/inventory-items', methods=['POST'])
def add_product_to_shelf(shelf_id):
    """
    API endpoint to create an InventoryItem from selected product and shelf.
    Body: {productId, shelfCount?}
    """
    try:
        shelf_id = _normalize_urn(shelf_id, 'Shelf')
        data = request.get_json() or {}

        product_id = _normalize_urn((data.get('productId') or '').strip(), 'Product')
        if not product_id:
            return {'error': 'productId is required'}, 400

        shelf_count = _safe_number(data.get('shelfCount'), 1)
        if shelf_count <= 0:
            return {'error': 'Counts must be greater than 0'}, 400

        shelf = orion.get_entity(shelf_id)
        if not shelf:
            return {'error': 'Shelf not found'}, 404

        max_capacity = _safe_number(shelf.get('maxCapacity', {}).get('value'), 0)
        if max_capacity <= 0:
            return {'error': 'Shelf has invalid capacity'}, 400
        effective_capacity = min(max_capacity, SHELF_ABSOLUTE_CAPACITY)

        product = orion.get_entity(product_id)
        if not product:
            return {'error': 'Product not found'}, 404

        store_id = shelf.get('refStore', {}).get('value')
        if not store_id:
            return {'error': 'Shelf has no valid refStore'}, 400

        # stockCount is store-level total for this product. Recompute from shelfCount values.
        store_inventory_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refStore=='{store_id}'"
        )
        current_total_store_stock = sum(
            _safe_number(item.get('shelfCount', {}).get('value'), 0)
            for item in store_inventory_items
            if item.get('refProduct', {}).get('value') == product_id
        )
        updated_total_store_stock = current_total_store_stock + shelf_count

        # Prevent duplicated rows per (shelf, product): merge counts into existing item.
        shelf_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refShelf=='{shelf_id}'"
        )
        current_shelf_units = sum(
            _safe_number(item.get('shelfCount', {}).get('value'), 0)
            for item in shelf_items
        )
        maximum_allowed = max(0, effective_capacity - current_shelf_units)

        # Validate against total occupancy in the shelf, not only one product row.
        if shelf_count > maximum_allowed:
            return {
                'error': 'Shelf capacity exceeded',
                'errorCode': 'SHELF_CAPACITY_EXCEEDED',
                'details': {
                    'current': current_shelf_units,
                    'requested': shelf_count,
                    'capacity': effective_capacity,
                    'maximumAllowed': maximum_allowed
                }
            }, 400

        existing_item = next(
            (
                item for item in shelf_items
                if item.get('refProduct', {}).get('value') == product_id
            ),
            None
        )

        if existing_item:
            existing_id = existing_item.get('id')
            current_shelf_count = _safe_number(existing_item.get('shelfCount', {}).get('value'), 0)
            new_shelf_count = current_shelf_count + shelf_count

            merged_attrs = {
                'shelfCount': orion.build_attr(new_shelf_count, 'Number'),
                'stockCount': orion.build_attr(updated_total_store_stock, 'Number')
            }

            success = orion.update_entity_attributes(existing_id, merged_attrs)
            if not success:
                return {'error': 'Could not merge inventory item in Orion'}, 400

            return {
                'success': True,
                'merged': True,
                'inventoryItem': {
                    'id': existing_id,
                    'refProduct': orion.build_attr(product_id, 'Relationship'),
                    'refShelf': orion.build_attr(shelf_id, 'Relationship'),
                    'refStore': orion.build_attr(store_id, 'Relationship'),
                    'shelfCount': orion.build_attr(new_shelf_count, 'Number'),
                    'stockCount': orion.build_attr(updated_total_store_stock, 'Number')
                }
            }, 200

        inventory_id = (
            f"urn:ngsi-ld:InventoryItem:"
            f"{shelf_id.split(':')[-1]}-{product_id.split(':')[-1]}-{uuid.uuid4().hex[:8]}"
        )

        inventory_item = {
            'id': inventory_id,
            'type': 'InventoryItem',
            'refProduct': orion.build_attr(product_id, 'Relationship'),
            'refShelf': orion.build_attr(shelf_id, 'Relationship'),
            'refStore': orion.build_attr(store_id, 'Relationship'),
            'shelfCount': orion.build_attr(shelf_count, 'Number'),
            'stockCount': orion.build_attr(updated_total_store_stock, 'Number')
        }

        success = orion.create_entity(inventory_item)
        if not success:
            return {'error': 'Could not create inventory item in Orion'}, 400

        return {'success': True, 'inventoryItem': inventory_item}, 201
    except Exception as e:
        logger.error(f"Error adding product to shelf {shelf_id}: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# PATCH /api/inventory-items/<inventory_item_id>/buy - Decrement inventory
# ============================================================================

@bp.route('/api/inventory-items/<path:inventory_item_id>/buy', methods=['PATCH'])
def buy_inventory_item(inventory_item_id):
    """
    API endpoint to buy one unit from an InventoryItem.
    Sends the exact required Orion PATCH payload with $inc -1.
    """
    try:
        inventory_item_id = _normalize_urn(inventory_item_id, 'InventoryItem')

        target_item = orion.get_entity(inventory_item_id)
        if not target_item:
            return {'error': 'Inventory item not found'}, 404

        current_shelf_count = _safe_number(target_item.get('shelfCount', {}).get('value'), 0)
        current_stock_count = _safe_number(target_item.get('stockCount', {}).get('value'), 0)

        if current_shelf_count <= 0:
            return {'error': 'No stock available on this shelf'}, 400

        if current_stock_count <= 0:
            return {'error': 'No stock available for this inventory item'}, 400

        attrs = {
            'shelfCount': {
                'type': 'Integer',
                'value': {'$inc': -1}
            },
            'stockCount': {
                'type': 'Integer',
                'value': {'$inc': -1}
            }
        }

        success = orion.update_entity_attributes(inventory_item_id, attrs)
        if not success:
            return {'error': f'Could not update inventory item {inventory_item_id} in Orion'}, 400

        return {
            'success': True,
            'inventoryItemId': inventory_item_id,
            'newShelfCount': current_shelf_count - 1,
            'newStockCount': current_stock_count - 1
        }, 200
    except Exception as e:
        logger.error(f"Error buying inventory item {inventory_item_id}: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# POST /api/stores - Create new store
# ============================================================================

@bp.route('/api/stores', methods=['POST'])
def create_store():
    """
    API endpoint to create a new store.
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('id'):
            return {'error': 'Missing required fields'}, 400
        
        store = {
            'id': data['id'] if data['id'].startswith('urn:') else f"urn:ngsi-ld:Store:{data['id']}",
            'type': 'Store',
            'name': orion.build_attr(data.get('name', ''), 'Text'),
            'url': orion.build_attr(data.get('url', ''), 'Text'),
            'telephone': orion.build_attr(data.get('telephone', ''), 'Text'),
            'countryCode': orion.build_attr(data.get('countryCode', ''), 'Text'),
            'capacity': orion.build_attr(float(data.get('capacity', 0)), 'Number'),
            'description': orion.build_attr(data.get('description', ''), 'Text'),
            'address': orion.build_attr(data.get('address', {}), 'StructuredValue'),
            'location': orion.build_attr(data.get('location', {}), 'geo:json'),
            'image': orion.build_attr(data.get('image', ''), 'Text')
        }
        
        success = orion.create_entity(store)
        return {'success': success}, 201 if success else 400
    except Exception as e:
        logger.error(f"Error creating store: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# PATCH /api/stores/<store_id> - Update store
# ============================================================================

@bp.route('/api/stores/<store_id>', methods=['PATCH'])
def update_store(store_id):
    """
    API endpoint to update store attributes.
    """
    try:
        if not store_id.startswith('urn:'):
            store_id = f"urn:ngsi-ld:Store:{store_id}"
        
        data = request.get_json()
        attrs = {}
        
        # Build updated attributes
        if 'name' in data:
            attrs['name'] = orion.build_attr(data['name'], 'Text')
        if 'url' in data:
            attrs['url'] = orion.build_attr(data.get('url', ''), 'Text')
        if 'telephone' in data:
            attrs['telephone'] = orion.build_attr(data.get('telephone', ''), 'Text')
        if 'countryCode' in data:
            attrs['countryCode'] = orion.build_attr(data.get('countryCode', ''), 'Text')
        if 'capacity' in data:
            attrs['capacity'] = orion.build_attr(float(data['capacity']), 'Number')
        if 'description' in data:
            attrs['description'] = orion.build_attr(data['description'], 'Text')
        if 'address' in data:
            attrs['address'] = orion.build_attr(data.get('address', {}), 'StructuredValue')
        if 'location' in data:
            attrs['location'] = orion.build_attr(data.get('location', {}), 'geo:json')
        if 'image' in data:
            attrs['image'] = orion.build_attr(data.get('image', ''), 'Text')
        
        if not attrs:
            return {'error': 'No attributes to update'}, 400
        
        success = orion.update_entity_attributes(store_id, attrs)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error updating store: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# DELETE /api/stores/<store_id> - Delete store
# ============================================================================

@bp.route('/api/stores/<store_id>', methods=['DELETE'])
def delete_store(store_id):
    """
    API endpoint to delete a store.
    """
    try:
        if not store_id.startswith('urn:'):
            store_id = f"urn:ngsi-ld:Store:{store_id}"

        inventory_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refStore=='{store_id}'"
        )
        failed_inventory_deletes = []
        for item in inventory_items:
            item_id = item.get('id')
            if not item_id:
                continue
            if not orion.delete_entity(item_id):
                failed_inventory_deletes.append(item_id)

        if failed_inventory_deletes:
            logger.error(
                "Error deleting InventoryItems for Store %s: %s",
                store_id,
                failed_inventory_deletes
            )
            return {
                'error': 'Could not delete related InventoryItems',
                'failedInventoryItems': failed_inventory_deletes
            }, 500

        shelves = orion.get_entities(
            entity_type='Shelf',
            query=f"refStore=='{store_id}'"
        )
        failed_shelf_deletes = []
        for shelf in shelves:
            shelf_id = shelf.get('id')
            if not shelf_id:
                continue
            if not orion.delete_entity(shelf_id):
                failed_shelf_deletes.append(shelf_id)

        if failed_shelf_deletes:
            logger.error(
                "Error deleting Shelves for Store %s: %s",
                store_id,
                failed_shelf_deletes
            )
            return {
                'error': 'Could not delete related Shelves',
                'failedShelves': failed_shelf_deletes
            }, 500

        success = orion.delete_entity(store_id)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error deleting store: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /api/stores - JSON list of stores
# ============================================================================

@bp.route('/api/stores', methods=['GET'])
def api_list_stores():
    """
    API endpoint returning JSON list of stores.
    """
    try:
        limit = request.args.get('limit', 1000, type=int)
        stores = orion.get_entities(entity_type='Store', limit=limit)
        stores = [store for store in stores if _is_project_store_id(store.get('id'))]
        return {'stores': stores}, 200
    except Exception as e:
        logger.error(f"Error fetching stores: {e}")
        return {'error': str(e)}, 500

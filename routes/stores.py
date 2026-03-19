"""
Blueprint: stores.py
CRUD operations and views for Store entities, including inventory management.
"""

import logging
from flask import Blueprint, render_template, request, jsonify
from modules import orion

logger = logging.getLogger(__name__)

bp = Blueprint('stores', __name__, url_prefix='')

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
        
        # Get shelf count for each store
        for store in stores:
            store_id = store.get('id')
            shelves = orion.get_entities(
                entity_type='Shelf',
                query=f"refStore=='{store_id}'"
            )
            store['shelf_count'] = len(shelves)
        
        return render_template('stores.html', stores=stores)
    except Exception as e:
        logger.error(f"Error listing stores: {e}")
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
        if not store_id.startswith('urn:'):
            store_id = f"urn:ngsi-ld:Store:{store_id}"
        
        # Get store with context provider attributes (temperature, humidity)
        store = orion.get_entity(store_id, include_attrs='name,address,telephone,capacity,countryCode,url,description,temperature,relativeHumidity,tweets')
        if not store:
            return render_template('error.html',
                                 error='Almacén no encontrado'), 404
        
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
        for item in inventory_items:
            shelf_id = item.get('refShelf', {}).get('value', 'Unknown')
            if shelf_id not in inventory_by_shelf:
                inventory_by_shelf[shelf_id] = []
            inventory_by_shelf[shelf_id].append(item)
        
        # Calculate dynamic numberOfItems and capacity for each shelf
        for shelf in shelves:
            shelf_id = shelf.get('id')
            items_in_shelf = inventory_by_shelf.get(shelf_id, [])
            
            # Calculate actual item count from inventory
            shelf['calculated_item_count'] = len(items_in_shelf)
            
            # Calculate capacity fill percentage
            max_capacity = shelf.get('maxCapacity', {}).get('value', 1)
            item_count = shelf['calculated_item_count']
            fill_percent = int((item_count / max_capacity) * 100) if max_capacity > 0 else 0
            
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
            # Fetch all products (using query with OR for each ID)
            products = orion.get_entities(entity_type='Product', limit=1000)
        
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
        if not store_id.startswith('urn:'):
            store_id = f"urn:ngsi-ld:Store:{store_id}"
        
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
        if not shelf_id.startswith('urn:'):
            shelf_id = f"urn:ngsi-ld:Shelf:{shelf_id}"
        
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
        if not store_id.startswith('urn:'):
            store_id = f"urn:ngsi-ld:Store:{store_id}"
        if not product_id.startswith('urn:'):
            product_id = f"urn:ngsi-ld:Product:{product_id}"
        
        # Get all shelves in store
        all_shelves = orion.get_entities(
            entity_type='Shelf',
            query=f"refStore=='{store_id}'"
        )
        
        # Get inventory items for this product in this store
        product_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refProduct=='{product_id}' AND refStore=='{store_id}'"
        )
        
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
        return render_template('stores_map.html', stores=stores)
    except Exception as e:
        logger.error(f"Error rendering map: {e}")
        return render_template('stores_map.html', stores=[], error=str(e))

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
        if 'capacity' in data:
            attrs['capacity'] = orion.build_attr(float(data['capacity']), 'Number')
        if 'description' in data:
            attrs['description'] = orion.build_attr(data['description'], 'Text')
        
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
        return {'stores': stores}, 200
    except Exception as e:
        logger.error(f"Error fetching stores: {e}")
        return {'error': str(e)}, 500

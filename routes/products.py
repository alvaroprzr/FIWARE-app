"""
Blueprint: products.py
CRUD operations and views for Product entities.
"""

import logging
from flask import Blueprint, render_template, request, jsonify
from modules import orion

logger = logging.getLogger(__name__)

bp = Blueprint('products', __name__, url_prefix='')


def _safe_number(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

# ============================================================================
# GET /products - List all products
# ============================================================================

@bp.route('/products', methods=['GET'])
def list_products():
    """
    Render products list page with pagination.
    Displays all products with images, prices, and inventory per store/shelf.
    """
    try:
        products = orion.get_entities(entity_type='Product', limit=1000)
        
        # For each product, get its inventory items
        for product in products:
            product_id = product.get('id')
            inventory = orion.get_entities(
                entity_type='InventoryItem',
                query=f"refProduct=='{product_id}'"
            )
            product['inventory_count'] = len(inventory)
        
        return render_template('products.html', products=products)
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        return render_template('products.html', products=[], error=str(e))

# ============================================================================
# GET /products/new - New product form (placeholder)
# ============================================================================

@bp.route('/products/new', methods=['GET'])
def new_product():
    """
    GET /products/new - Show form to create new product.
    Renders a form template for adding a new product to the catalog.
    """
    return render_template('add_product_form.html')

# ============================================================================
# GET /products/<product_id> - Product detail page
# ============================================================================

@bp.route('/products/<product_id>', methods=['GET'])
def product_detail(product_id):
    """
    Render detailed view of a single product.
    Shows inventory distribution across all stores and shelves.
    """
    try:
        # Reconstruct full URN if needed
        if not product_id.startswith('urn:'):
            product_id = f"urn:ngsi-ld:Product:{product_id}"
        
        product = orion.get_entity(product_id)
        if not product:
            return render_template('error.html', 
                                 error='Producto no encontrado'), 404
        
        # Get all inventory items for this product
        inventory_items = orion.get_entities(
            entity_type='InventoryItem',
            query=f"refProduct=='{product_id}'"
        )
        
        # Organization by store with totalStock calculation
        inventory_by_store = {}
        involved_store_ids = set()
        shelf_ids = set()
        
        for item in inventory_items:
            store_id = item.get('refStore', {}).get('value', 'Unknown')
            
            if store_id not in inventory_by_store:
                inventory_by_store[store_id] = {
                    'shelves': [],
                    'totalStock': 0,
                    'store_name': ''
                }
            involved_store_ids.add(store_id)

            shelf_id = item.get('refShelf', {}).get('value')
            if shelf_id:
                shelf_ids.add(shelf_id)
            
            # Real stock in this view is the sum of shelfCount for the same product+store.
            shelf_count = _safe_number(item.get('shelfCount', {}).get('value', 0), 0)
            inventory_by_store[store_id]['totalStock'] += shelf_count
            inventory_by_store[store_id]['shelves'].append(item)

        shelf_names = {}
        if shelf_ids:
            shelves = orion.get_entities(entity_type='Shelf', limit=1000)
            shelf_names = {
                shelf.get('id'): shelf.get('name', {}).get('value', shelf.get('id', '').split(':')[-1])
                for shelf in shelves
                if shelf.get('id') in shelf_ids
            }

        for store_data in inventory_by_store.values():
            for item in store_data['shelves']:
                shelf_id = item.get('refShelf', {}).get('value')
                item['shelfName'] = shelf_names.get(shelf_id, shelf_id.split(':')[-1] if shelf_id else 'Unknown')
        
        # Fetch store names to display
        if inventory_by_store:
            stores = orion.get_entities(entity_type='Store', limit=1000)
            for store in stores:
                store_id = store.get('id')
                if store_id in involved_store_ids:
                    store_name = store.get('name', {}).get('value', store_id.split(':')[-1])
                    inventory_by_store[store_id]['store_name'] = store_name
        
        return render_template('product_detail.html', 
                             product=product,
                             inventory_items=inventory_items,
                             inventory_by_store=inventory_by_store)
    except Exception as e:
        logger.error(f"Error fetching product detail: {e}")
        return render_template('error.html', error=str(e)), 500

# ============================================================================
# POST /api/products - Create new product
# ============================================================================

@bp.route('/api/products', methods=['POST'])
def create_product():
    """
    API endpoint to create a new product.
    Body: {name, price, size, color, image}
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('id'):
            return {'error': 'Missing required fields'}, 400
        
        product = {
            'id': data['id'] if data['id'].startswith('urn:') else f"urn:ngsi-ld:Product:{data['id']}",
            'type': 'Product',
            'name': orion.build_attr(data.get('name', ''), 'Text'),
            'price': orion.build_attr(float(data.get('price', 0)), 'Number'),
            'size': orion.build_attr(data.get('size', ''), 'Text'),
            'color': orion.build_attr(data.get('color', '#000000'), 'Text'),
            'image': orion.build_attr(data.get('image', ''), 'Text')
        }
        
        success = orion.create_entity(product)
        return {'success': success}, 201 if success else 400
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# PATCH /api/products/<product_id> - Update product
# ============================================================================

@bp.route('/api/products/<product_id>', methods=['PATCH'])
def update_product(product_id):
    """
    API endpoint to update a product's attributes.
    Body: {name?, price?, size?, color?, image?}
    """
    try:
        if not product_id.startswith('urn:'):
            product_id = f"urn:ngsi-ld:Product:{product_id}"
        
        data = request.get_json()
        attrs = {}
        
        if 'name' in data:
            attrs['name'] = orion.build_attr(data['name'], 'Text')
        if 'price' in data:
            attrs['price'] = orion.build_attr(float(data['price']), 'Number')
        if 'size' in data:
            attrs['size'] = orion.build_attr(data['size'], 'Text')
        if 'color' in data:
            attrs['color'] = orion.build_attr(data['color'], 'Text')
        if 'image' in data:
            attrs['image'] = orion.build_attr(data['image'], 'Text')
        
        if not attrs:
            return {'error': 'No attributes to update'}, 400
        
        success = orion.update_entity_attributes(product_id, attrs)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# DELETE /api/products/<product_id> - Delete product
# ============================================================================

@bp.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """
    API endpoint to delete a product.
    Warning: Will cascade delete related InventoryItems.
    """
    try:
        if not product_id.startswith('urn:'):
            product_id = f"urn:ngsi-ld:Product:{product_id}"
        
        success = orion.delete_entity(product_id)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /api/products - JSON list of products
# ============================================================================

@bp.route('/api/products', methods=['GET'])
def api_list_products():
    """
    API endpoint returning JSON list of products.
    Optional query parameters: limit, type
    """
    try:
        limit = request.args.get('limit', 1000, type=int)
        products = orion.get_entities(entity_type='Product', limit=limit)
        return {'products': products}, 200
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return {'error': str(e)}, 500

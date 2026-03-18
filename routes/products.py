"""
Blueprint: products.py
CRUD operations and views for Product entities.
"""

import logging
from flask import Blueprint, render_template, request, jsonify
from modules import orion

logger = logging.getLogger(__name__)

bp = Blueprint('products', __name__, url_prefix='')

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
                query=f"refProduct=='{product_id}'"
            )
            product['inventory_count'] = len(inventory)
        
        return render_template('products.html', products=products)
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        return render_template('products.html', products=[], error=str(e))

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
            query=f"refProduct=='{product_id}'"
        )
        
        # Organization by store/shelf
        inventory_by_store = {}
        for item in inventory_items:
            store_id = item.get('refStore', {}).get('value', 'Unknown')
            shelf_id = item.get('refShelf', {}).get('value', 'Unknown')
            
            if store_id not in inventory_by_store:
                inventory_by_store[store_id] = {}
            
            if shelf_id not in inventory_by_store[store_id]:
                inventory_by_store[store_id][shelf_id] = []
            
            inventory_by_store[store_id][shelf_id].append(item)
        
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

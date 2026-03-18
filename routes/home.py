"""
Blueprint: home.py
Main dashboard with statistics, entity counts, and data visualization.
"""

import logging
from flask import Blueprint, render_template
from modules import orion

logger = logging.getLogger(__name__)

bp = Blueprint('home', __name__, url_prefix='')

# ============================================================================
# GET / - Main dashboard
# ============================================================================

@bp.route('/', methods=['GET'])
def home():
    """
    Render main dashboard with:
    - Entity statistics (count of each entity type)
    - Mermaid erDiagram of data model
    - Recent notifications panel
    """
    try:
        # Get entity counts
        stores = orion.get_entities(entity_type='Store')
        products = orion.get_entities(entity_type='Product')
        shelves = orion.get_entities(entity_type='Shelf')
        employees = orion.get_entities(entity_type='Employee')
        inventory_items = orion.get_entities(entity_type='InventoryItem')
        
        stats = {
            'stores_count': len(stores),
            'products_count': len(products),
            'shelves_count': len(shelves),
            'employees_count': len(employees),
            'inventory_items_count': len(inventory_items),
            'total_entities': len(stores) + len(products) + len(shelves) + 
                            len(employees) + len(inventory_items)
        }
        
        logger.info(f"Dashboard stats: {stats}")
        
        return render_template('home.html', stats=stats)
    except Exception as e:
        logger.error(f"Error rendering dashboard: {e}")
        return render_template('home.html', stats={}, error=str(e))

# ============================================================================
# GET /api/stats - JSON statistics endpoint
# ============================================================================

@bp.route('/api/stats', methods=['GET'])
def get_stats():
    """Return JSON statistics for API clients."""
    try:
        stores = orion.get_entities(entity_type='Store')
        products = orion.get_entities(entity_type='Product')
        shelves = orion.get_entities(entity_type='Shelf')
        employees = orion.get_entities(entity_type='Employee')
        inventory_items = orion.get_entities(entity_type='InventoryItem')
        
        return {
            'stores': len(stores),
            'products': len(products),
            'shelves': len(shelves),
            'employees': len(employees),
            'inventory_items': len(inventory_items)
        }, 200
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {'error': str(e)}, 500

"""
Blueprint: notifications.py
Webhook endpoints for Orion Context Broker subscription notifications.
Receives real-time events and broadcasts them via Socket.IO to connected clients.
"""

import logging
from datetime import datetime, timezone
from flask import Blueprint, request, current_app
from modules import orion

logger = logging.getLogger(__name__)

bp = Blueprint('notifications', __name__, url_prefix='')


def _payload_data_items(payload):
    """
    Normalize Orion webhook payload data list.
    """
    if not isinstance(payload, dict):
        return []

    items = payload.get('data', [])
    if isinstance(items, list):
        return items
    return []


def _entity_name(entity_id):
    """
    Resolve a human-readable name from an Orion entity ID.
    """
    if not entity_id:
        return None

    entity = orion.get_entity(entity_id)
    if not entity:
        return None

    return entity.get('name', {}).get('value')

# ============================================================================
# POST /notify/price-change - Price change webhook
# ============================================================================

@bp.route('/notify/price-change', methods=['POST'])
def notify_price_change():
    """
    Webhook endpoint for product price change notifications from Orion.
    
    Receives:
    - subscriptionId: Subscription identifier
    - data: Array of data objects with price changes
    
    Broadcasts to all connected clients via Socket.IO.
    """
    try:
        payload = request.get_json()
        
        logger.info(f"Price change notification received: {payload}")
        
        # Get socketio instance from current app
        socketio = current_app.extensions.get('socketio')
        if socketio is None:
            logger.warning("SocketIO not initialized, cannot emit events")
            return {'status': 'ok'}, 200
        
        # Extract price change data
        for data_item in _payload_data_items(payload):
            if not isinstance(data_item, dict):
                continue

            product_id = data_item.get('id')
            price = data_item.get('price', {}).get('value')

            if not product_id or price is None:
                logger.warning(f"Invalid price change payload item: {data_item}")
                continue

            inventory_items = orion.get_entities(
                entity_type='InventoryItem',
                query=f"refProduct=='{product_id}'"
            )
            impacted_store_ids = sorted({
                item.get('refStore', {}).get('value')
                for item in inventory_items
                if isinstance(item, dict) and item.get('refStore', {}).get('value')
            })

            event_payload = {
                'product_id': product_id,
                'new_price': price,
                'store_ids': impacted_store_ids,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }

            # Broadcast to all connected clients
            socketio.emit('price_change', event_payload)

            logger.info(f"Socket emit price_change: {event_payload}")
        
        return {'status': 'ok'}, 200
    except Exception as e:
        logger.error(f"Error handling price change notification: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# POST /notify/low-stock - Low stock webhook
# ============================================================================

@bp.route('/notify/low-stock', methods=['POST'])
def notify_low_stock():
    """
    Webhook endpoint for low inventory notifications from Orion.
    
    Triggered by InventoryItem changes; low-stock is evaluated by store stockCount.
    
    Receives:
    - subscriptionId: Subscription identifier
    - data: Array of inventory items with low counts
    
    Broadcasts to all connected clients via Socket.IO.
    """
    try:
        payload = request.get_json()
        
        logger.info(f"Low stock notification received: {payload}")
        
        # Get socketio instance from current app
        socketio = current_app.extensions.get('socketio')
        if socketio is None:
            logger.warning("SocketIO not initialized, cannot emit events")
            return {'status': 'ok'}, 200
        
        # Extract data and emit only when STORE stock for that product is low.
        for data_item in _payload_data_items(payload):
            if not isinstance(data_item, dict):
                continue

            item_id = data_item.get('id')
            product_id = data_item.get('refProduct', {}).get('value')
            store_id = data_item.get('refStore', {}).get('value')

            if not item_id or not product_id or not store_id:
                logger.warning(f"Invalid low stock payload item: {data_item}")
                continue

            related_items = orion.get_entities(
                entity_type='InventoryItem',
                query=f"refStore=='{store_id}';refProduct=='{product_id}'"
            )

            total_store_stock = sum(
                int(item.get('shelfCount', {}).get('value', 0) or 0)
                for item in related_items
                if isinstance(item, dict)
            )

            # Rule: notify on low stock of the STORE (not shelf-level scarcity).
            if total_store_stock >= 3:
                continue

            product_name = _entity_name(product_id) or product_id.split(':')[-1]
            store_name = _entity_name(store_id) or store_id.split(':')[-1]

            event_payload = {
                'item_id': item_id,
                'product_id': product_id,
                'store_id': store_id,
                'product_name': product_name,
                'store_name': store_name,
                'stockCount': total_store_stock,
                # Backward compatibility for existing frontend listeners.
                'stock_count': total_store_stock,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }

            socketio.emit('low_stock', event_payload)
            logger.warning(f"Socket emit low_stock (store-level): {event_payload}")
        
        return {'status': 'ok'}, 200
    except Exception as e:
        logger.error(f"Error handling low stock notification: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /api/notifications - Notification history (optional)
# ============================================================================

@bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    """
    API endpoint to retrieve notification history.
    In production, this would query a database.
    For now, returns empty list (real-time via Socket.IO is primary mechanism).
    """
    return {'notifications': []}, 200

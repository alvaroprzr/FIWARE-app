"""
Blueprint: notifications.py
Webhook endpoints for Orion Context Broker subscription notifications.
Receives real-time events and broadcasts them via Socket.IO to connected clients.
"""

import logging
from flask import Blueprint, request, current_app

logger = logging.getLogger(__name__)

bp = Blueprint('notifications', __name__, url_prefix='')

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
        if payload and 'data' in payload:
            for data_item in payload['data']:
                product_id = data_item.get('id')
                price = data_item.get('price', {}).get('value')
                
                # Broadcast to all connected clients
                socketio.emit('price_change', {
                    'product_id': product_id,
                    'new_price': price,
                    'timestamp': data_item.get('modified')
                }, broadcast=True)
                
                logger.info(f"Broadcasted price change: {product_id} -> {price}")
        
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
    
    Triggered when InventoryItem shelfCount < 3
    
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
        
        # Extract low stock data
        if payload and 'data' in payload:
            for data_item in payload['data']:
                item_id = data_item.get('id')
                shelf_count = data_item.get('shelfCount', {}).get('value')
                product_id = data_item.get('refProduct', {}).get('value')
                shelf_id = data_item.get('refShelf', {}).get('value')
                store_id = data_item.get('refStore', {}).get('value')
                
                # Broadcast to all connected clients
                socketio.emit('low_stock', {
                    'item_id': item_id,
                    'shelf_count': shelf_count,
                    'product_id': product_id,
                    'shelf_id': shelf_id,
                    'store_id': store_id,
                    'timestamp': data_item.get('modified')
                }, broadcast=True)
                
                logger.warning(f"Low stock alert: {item_id} (count={shelf_count})")
        
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

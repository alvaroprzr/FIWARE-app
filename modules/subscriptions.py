"""
Module: subscriptions.py
Register and manage Orion Context Broker subscriptions for event notifications.
Subscriptions trigger webhook callbacks on specific entity attribute changes.
"""

import os
import logging
from modules import orion

logger = logging.getLogger(__name__)

WEBHOOK_URL_BASE = os.getenv('WEBHOOK_URL_BASE', 'http://host.docker.internal:5000')

# ============================================================================
# Subscription 1: Price Change Notifications
# ============================================================================

def register_price_change_subscription():
    """
    Register a subscription for price attribute changes in Product entities.
    Triggers notification when product price is updated.
    Webhook: POST /notify/price-change
    """
    subscription = {
        'description': 'Price change notifications for products',
        'subject': {
            'entities': [
                {
                    'type': 'Product',
                    'idPattern': '.*'
                }
            ],
            'condition': {
                'attrs': ['price']
            }
        },
        'notification': {
            'http': {
                'url': f"{WEBHOOK_URL_BASE}/notify/price-change"
            },
            'attrs': ['price'],
            'attrsFormat': 'normalized'
        },
        'expires': '2099-12-31T23:59:59Z'
    }
    
    success = orion.create_subscription(subscription)
    if success:
        logger.info("✓ Price change subscription registered")
    else:
        logger.error("✗ Failed to register price change subscription")
    
    return success

# ============================================================================
# Subscription 2: Low Stock Notifications
# ============================================================================

def register_low_stock_subscription():
    """
    Register a subscription for low inventory on Shelf entities.
    Triggers notification when shelf item count drops below 3.
    Webhook: POST /notify/low-stock
    """
    subscription = {
        'description': 'Low stock notifications for inventory items',
        'subject': {
            'entities': [
                {
                    'type': 'InventoryItem',
                    'idPattern': '.*'
                }
            ],
            'condition': {
                'attrs': ['shelfCount'],
                'expression': {
                    'q': 'shelfCount<3'
                }
            }
        },
        'notification': {
            'http': {
                'url': f"{WEBHOOK_URL_BASE}/notify/low-stock"
            },
            'attrs': ['shelfCount', 'refProduct', 'refShelf', 'refStore'],
            'attrsFormat': 'normalized'
        },
        'expires': '2099-12-31T23:59:59Z'
    }
    
    success = orion.create_subscription(subscription)
    if success:
        logger.info("✓ Low stock subscription registered")
    else:
        logger.error("✗ Failed to register low stock subscription")
    
    return success

# ============================================================================
# Initialization function
# ============================================================================

def register_all_subscriptions():
    """
    Register all subscriptions.
    Called on application startup from app.py::initialize_orion_integration()
    """
    logger.info("Registering event subscriptions...")
    
    results = {
        'price_change': register_price_change_subscription(),
        'low_stock': register_low_stock_subscription()
    }
    
    success_count = sum(1 for v in results.values() if v)
    logger.info(f"Subscription registration completed: {success_count}/2 successful")
    
    return results

def cleanup_subscriptions():
    """
    Delete all subscriptions (useful for cleanup during development).
    Not called during normal operation.
    """
    logger.warning("Cleaning up subscriptions...")
    subscriptions = orion.get_subscriptions()
    
    for sub in subscriptions:
        orion.delete_subscription(sub['id'])
        logger.info(f"Deleted subscription: {sub['id']}")

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


def _subscription_exists(description: str) -> bool:
    """
    Check if a subscription already exists in Orion by description.
    This prevents duplicate subscriptions across app restarts.
    """
    subscriptions = orion.get_subscriptions()
    for subscription in subscriptions:
        if subscription.get('description') == description:
            return True
    return False


def _delete_subscriptions_by_description(description: str) -> None:
    """
    Remove subscriptions by description (used for migration of old rules).
    """
    subscriptions = orion.get_subscriptions()
    for subscription in subscriptions:
        if subscription.get('description') != description:
            continue
        sub_id = subscription.get('id')
        if sub_id:
            orion.delete_subscription(sub_id)
            logger.info(f"Deleted obsolete subscription: {description} ({sub_id})")

# ============================================================================
# Subscription 1: Price Change Notifications
# ============================================================================

def register_price_change_subscription():
    """
    Register a subscription for price attribute changes in Product entities.
    Triggers notification when product price is updated.
    Webhook: POST /notify/price-change
    """
    description = 'Price change notifications for products'

    if _subscription_exists(description):
        logger.info("Price change subscription already exists, skipping creation")
        return True

    subscription = {
        'description': description,
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
    Register a subscription for inventory changes and evaluate low stock at store level.
    Business rule is computed in webhook: low stock by store+product (not by single shelf).
    Webhook: POST /notify/low-stock
    """
    legacy_description = 'Low stock notifications for inventory items'
    description = 'Low stock notifications by store stock'

    # Remove legacy subscription so old shelf-level rule does not keep firing.
    _delete_subscriptions_by_description(legacy_description)

    if _subscription_exists(description):
        logger.info("Low stock subscription already exists, skipping creation")
        return True

    subscription = {
        'description': description,
        'subject': {
            'entities': [
                {
                    'type': 'InventoryItem',
                    'idPattern': '.*'
                }
            ],
            'condition': {
                'attrs': ['shelfCount', 'stockCount']
            }
        },
        'notification': {
            'http': {
                'url': f"{WEBHOOK_URL_BASE}/notify/low-stock"
            },
            'attrs': ['shelfCount', 'stockCount', 'refProduct', 'refShelf', 'refStore'],
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

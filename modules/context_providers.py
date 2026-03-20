"""
Module: context_providers.py
Register and manage external context providers with Orion Context Broker.
These providers supply dynamic attributes like temperature, humidity, and tweets.
"""

import os
import logging
from modules import orion

logger = logging.getLogger(__name__)

TUTORIAL_URL = os.getenv('TUTORIAL_URL', 'http://tutorial:3000')


def _build_store_provider_registration(attrs):
    """
    Build Orion registration payload for Store attributes backed by external provider.
    """
    return {
        'dataProvided': {
            'entities': [
                {
                    'type': 'Store',
                    'idPattern': '.*'
                }
            ],
            'attrs': attrs
        },
        'provider': {
            'http': {
                'url': f"{TUTORIAL_URL.rstrip('/')}/api"
            },
            'legacyForwarding': True
        }
    }


def _register_store_provider(attrs, provider_name):
    """
    Register a Store external provider in Orion and log the result.
    """
    provider_registration = _build_store_provider_registration(attrs)
    success = orion.register_context_provider(provider_registration)
    if success:
        logger.info("✓ %s provider registered (%s)", provider_name, ', '.join(attrs))
    else:
        logger.error("✗ Failed to register %s provider (%s)", provider_name, ', '.join(attrs))
    return success

# ============================================================================
# Provider 1: Temperature and Humidity Provider
# ============================================================================

def register_temperature_humidity_provider():
    """
    Register a context provider for temperature/humidity attributes of Store entities.
    External provider: FIWARE tutorial service on port 3000
    """
    return _register_store_provider(
        attrs=['temperature', 'relativeHumidity'],
        provider_name='Temperature/Humidity'
    )

# ============================================================================
# Provider 2: Tweets Provider
# ============================================================================

def register_tweets_provider():
    """
    Register a context provider for tweets attribute of Store entities.
    External provider: FIWARE tutorial service on port 3000
    """
    return _register_store_provider(
        attrs=['tweets'],
        provider_name='Tweets'
    )

# ============================================================================
# Initialization function
# ============================================================================

def register_all_providers():
    """
    Register all external context providers.
    Called on application startup from app.py::initialize_orion_integration()
    """
    logger.info("Registering external context providers (TUTORIAL_URL=%s)...", TUTORIAL_URL)
    
    results = {
        'temperature_humidity': register_temperature_humidity_provider(),
        'tweets': register_tweets_provider()
    }
    
    success_count = sum(1 for v in results.values() if v)
    logger.info(f"Provider registration completed: {success_count}/2 successful")
    
    return results

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

# ============================================================================
# Provider 1: Temperature and Humidity Provider
# ============================================================================

def register_temperature_humidity_provider():
    """
    Register a context provider for temperature/humidity attributes of Store entities.
    External provider: FIWARE tutorial service on port 3000
    """
    provider_registration = {
        'dataProvided': {
            'entities': [
                {
                    'type': 'Store',
                    'idPattern': '.*'
                }
            ],
            'attrs': ['temperature', 'relativeHumidity']
        },
        'provider': {
            'http': {
                'url': f"{TUTORIAL_URL}/api"
            },
            'legacyForwarding': True
        }
    }
    
    success = orion.register_context_provider(provider_registration)
    if success:
        logger.info("✓ Temperature/Humidity provider registered")
    else:
        logger.error("✗ Failed to register temperature/humidity provider")
    
    return success

# ============================================================================
# Provider 2: Tweets Provider
# ============================================================================

def register_tweets_provider():
    """
    Register a context provider for tweets attribute of Store entities.
    External provider: FIWARE tutorial service on port 3000
    """
    provider_registration = {
        'dataProvided': {
            'entities': [
                {
                    'type': 'Store',
                    'idPattern': '.*'
                }
            ],
            'attrs': ['tweets']
        },
        'provider': {
            'http': {
                'url': f"{TUTORIAL_URL}/api"
            },
            'legacyForwarding': True
        }
    }
    
    success = orion.register_context_provider(provider_registration)
    if success:
        logger.info("✓ Tweets provider registered")
    else:
        logger.error("✗ Failed to register tweets provider")
    
    return success

# ============================================================================
# Initialization function
# ============================================================================

def register_all_providers():
    """
    Register all external context providers.
    Called on application startup from app.py::initialize_orion_integration()
    """
    logger.info("Registering external context providers...")
    
    results = {
        'temperature_humidity': register_temperature_humidity_provider(),
        'tweets': register_tweets_provider()
    }
    
    success_count = sum(1 for v in results.values() if v)
    logger.info(f"Provider registration completed: {success_count}/2 successful")
    
    return results

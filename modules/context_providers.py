"""
Module: context_providers.py
Register and manage external context providers with Orion Context Broker.
These providers supply dynamic attributes like temperature, humidity, and tweets.
"""

import os
import logging
import requests
from modules import orion

logger = logging.getLogger(__name__)

TUTORIAL_URL = os.getenv('TUTORIAL_URL', 'http://tutorial:3000')
TUTORIAL_DIRECT_URL = os.getenv('TUTORIAL_DIRECT_URL', 'http://localhost:3000')


def _get_real_store_ids():
    """
    Get real Store IDs persisted in Orion (exclude provider-generated synthetic IDs).
    """
    stores = orion.get_entities(entity_type='Store', limit=1000)
    return [
        store.get('id')
        for store in stores
        if isinstance(store.get('id'), str) and store.get('id', '').startswith('urn:ngsi-ld:Store:')
    ]


def _get_provider_path_for_attrs(attrs):
    """
    Resolve the tutorial proxy endpoint for a specific attribute set.

    Orion with legacy forwarding appends '/queryContext' to this base URL,
    so returned paths intentionally omit that suffix.
    """
    attrs_set = set(attrs)
    if attrs_set == {'temperature', 'relativeHumidity'}:
        return '/random/weatherConditions'
    if attrs_set == {'tweets'}:
        return '/random/tweets'
    return '/random/weatherConditions'


def _query_legacy_provider(store_id, provider_path, attributes):
    """
    Query a tutorial legacy NGSIv1 provider endpoint and return attrs as NGSIv2-like dict.
    """
    payload = {
        'entities': [
            {
                'id': store_id,
                'type': 'Store',
                'isPattern': 'false'
            }
        ],
        'attributes': attributes
    }
    endpoint = f"{TUTORIAL_DIRECT_URL.rstrip('/')}{provider_path}/queryContext"

    response = requests.post(endpoint, json=payload, timeout=8)
    response.raise_for_status()

    body = response.json()
    context_responses = body.get('contextResponses', [])
    if not context_responses:
        return {}

    context_element = context_responses[0].get('contextElement', {})
    attrs = context_element.get('attributes', [])
    normalized = {}
    for attr in attrs:
        name = attr.get('name')
        if not name:
            continue
        normalized[name] = {
            'type': attr.get('type', 'Text'),
            'value': attr.get('value')
        }
    return normalized


def get_external_store_attrs(store_id):
    """
    Retrieve temperature/humidity/tweets directly from tutorial provider endpoints.
    Used as fallback when Orion responses do not include external attrs.
    """
    if not isinstance(store_id, str) or not store_id.startswith('urn:ngsi-ld:Store:'):
        logger.warning("Skipping external attrs fallback for invalid Store ID: %s", store_id)
        return {}

    attrs = {}
    try:
        attrs.update(
            _query_legacy_provider(
                store_id=store_id,
                provider_path='/random/weatherConditions',
                attributes=['temperature', 'relativeHumidity']
            )
        )
    except Exception as e:
        logger.warning("Fallback weather provider query failed for %s: %s", store_id, e)

    try:
        attrs.update(
            _query_legacy_provider(
                store_id=store_id,
                provider_path='/random/tweets',
                attributes=['tweets']
            )
        )
    except Exception as e:
        logger.warning("Fallback tweets provider query failed for %s: %s", store_id, e)

    return attrs


def _build_store_provider_registration(attrs, store_entities):
    """
    Build Orion registration payload for Store attributes backed by external provider.
    """
    provider_path = _get_provider_path_for_attrs(attrs)
    return {
        'dataProvided': {
            'entities': store_entities,
            'attrs': attrs
        },
        'provider': {
            'http': {
                'url': f"{TUTORIAL_URL.rstrip('/')}{provider_path}"
            },
            'legacyForwarding': True
        }
    }


def _cleanup_store_provider_registrations():
    """
    Remove stale/duplicated Store provider registrations so Orion uses only the current ones.
    """
    registrations = orion.get_registrations()
    deleted = 0
    for registration in registrations:
        provided = registration.get('dataProvided', {})
        entities = provided.get('entities', [])
        attrs = set(provided.get('attrs', []))
        registration_id = registration.get('id')
        has_store_entity = any(entity.get('type') == 'Store' for entity in entities)
        is_target_attrs = attrs in ({'temperature', 'relativeHumidity'}, {'tweets'})
        if has_store_entity and is_target_attrs and registration_id:
            if orion.delete_registration(registration_id):
                deleted += 1
    logger.info("Cleaned %s stale Store provider registrations", deleted)


def _register_store_provider(attrs, provider_name, store_entities):
    """
    Register a Store external provider in Orion and log the result.
    """
    provider_registration = _build_store_provider_registration(attrs, store_entities)
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
    store_entities = [{'type': 'Store', 'id': store_id} for store_id in _get_real_store_ids()]
    if not store_entities:
        logger.warning("No real Store entities found for Temperature/Humidity provider registration")
        return False

    return _register_store_provider(
        attrs=['temperature', 'relativeHumidity'],
        provider_name='Temperature/Humidity',
        store_entities=store_entities
    )

# ============================================================================
# Provider 2: Tweets Provider
# ============================================================================

def register_tweets_provider():
    """
    Register a context provider for tweets attribute of Store entities.
    External provider: FIWARE tutorial service on port 3000
    """
    store_entities = [{'type': 'Store', 'id': store_id} for store_id in _get_real_store_ids()]
    if not store_entities:
        logger.warning("No real Store entities found for Tweets provider registration")
        return False

    return _register_store_provider(
        attrs=['tweets'],
        provider_name='Tweets',
        store_entities=store_entities
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

    _cleanup_store_provider_registrations()
    
    results = {
        'temperature_humidity': register_temperature_humidity_provider(),
        'tweets': register_tweets_provider()
    }
    
    success_count = sum(1 for v in results.values() if v)
    logger.info(f"Provider registration completed: {success_count}/2 successful")
    
    return results

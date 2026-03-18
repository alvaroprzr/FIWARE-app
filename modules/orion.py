"""
Module: orion.py
Reusable functions for NGSIv2 CRUD operations and Orion Context Broker integration.
"""

import os
import json
import logging
import requests
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

ORION_URL = os.getenv('ORION_URL', 'http://localhost:1026')

# ============================================================================
# NGSIv2 Entity CRUD Operations
# ============================================================================

def get_entity(entity_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a single entity by ID from Orion Context Broker.
    
    Args:
        entity_id (str): The entity ID (e.g., 'urn:ngsi-ld:Store:madrid-centro')
    
    Returns:
        Dict with entity data or None if not found
    """
    try:
        url = f"{ORION_URL}/v2/entities/{entity_id}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error retrieving entity {entity_id}: {e}")
        return None

def get_entities(entity_type: Optional[str] = None, query: Optional[str] = None, 
                limit: int = 1000) -> List[Dict[str, Any]]:
    """
    Retrieve multiple entities from Orion Context Broker.
    
    Args:
        entity_type (str, optional): Filter by entity type (e.g., 'Store', 'Product')
        query (str, optional): NGSIv2 query string for filtering
        limit (int): Maximum number of entities to return
    
    Returns:
        List of entity dictionaries
    """
    try:
        url = f"{ORION_URL}/v2/entities"
        params = {'limit': limit}
        
        if entity_type:
            params['type'] = entity_type
        if query:
            params['q'] = query
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error retrieving entities: {e}")
        return []

def create_entity(entity_body: Dict[str, Any]) -> bool:
    """
    Create a new entity in Orion Context Broker.
    
    Args:
        entity_body (dict): NGSIv2 entity document with 'id' and 'type' keys
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/entities"
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(url, json=entity_body, headers=headers, timeout=5)
        
        if response.status_code == 201:
            logger.info(f"Entity created: {entity_body.get('id')}")
            return True
        else:
            logger.warning(f"Entity creation failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error creating entity: {e}")
        return False

def update_entity_attributes(entity_id: str, attributes: Dict[str, Any]) -> bool:
    """
    Update attributes of an existing entity.
    
    Args:
        entity_id (str): Entity ID
        attributes (dict): Dictionary of attributes to update
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/entities/{entity_id}/attrs"
        headers = {'Content-Type': 'application/json'}
        
        response = requests.patch(url, json=attributes, headers=headers, timeout=5)
        
        if response.status_code == 204:
            logger.info(f"Entity {entity_id} updated successfully")
            return True
        else:
            logger.warning(f"Update failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error updating entity: {e}")
        return False

def delete_entity(entity_id: str) -> bool:
    """
    Delete an entity from Orion Context Broker.
    
    Args:
        entity_id (str): Entity ID
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/entities/{entity_id}"
        response = requests.delete(url, timeout=5)
        
        if response.status_code == 204:
            logger.info(f"Entity {entity_id} deleted successfully")
            return True
        else:
            logger.warning(f"Delete failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error deleting entity: {e}")
        return False

# ============================================================================
# NGSIv2 Context Providers Registration
# ============================================================================

def register_context_provider(registration: Dict[str, Any]) -> bool:
    """
    Register a context provider with Orion Context Broker.
    
    Args:
        registration (dict): NGSIv2 registration document
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/registrations"
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(url, json=registration, headers=headers, timeout=5)
        
        if response.status_code == 201:
            logger.info(f"Provider registered: {registration.get('provider', {}).get('http', {}).get('url')}")
            return True
        else:
            logger.warning(f"Registration failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error registering provider: {e}")
        return False

# ============================================================================
# NGSIv2 Subscriptions Management
# ============================================================================

def create_subscription(subscription: Dict[str, Any]) -> bool:
    """
    Create a subscription in Orion Context Broker.
    
    Args:
        subscription (dict): NGSIv2 subscription document
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/subscriptions"
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(url, json=subscription, headers=headers, timeout=5)
        
        if response.status_code == 201:
            subscription_id = response.headers.get('Location', '').split('/')[-1]
            logger.info(f"Subscription created: {subscription_id}")
            return True
        else:
            logger.warning(f"Subscription creation failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error creating subscription: {e}")
        return False

def get_subscriptions() -> List[Dict[str, Any]]:
    """
    Retrieve all subscriptions from Orion Context Broker.
    
    Returns:
        List of subscription dictionaries
    """
    try:
        url = f"{ORION_URL}/v2/subscriptions"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error retrieving subscriptions: {e}")
        return []

def delete_subscription(subscription_id: str) -> bool:
    """
    Delete a subscription from Orion Context Broker.
    
    Args:
        subscription_id (str): Subscription ID
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/subscriptions/{subscription_id}"
        response = requests.delete(url, timeout=5)
        
        if response.status_code == 204:
            logger.info(f"Subscription {subscription_id} deleted")
            return True
        else:
            logger.warning(f"Delete failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error deleting subscription: {e}")
        return False

# ============================================================================
# Helper functions for NGSIv2 attribute formatting
# ============================================================================

def build_attr(value: Any, attr_type: str = "Text") -> Dict[str, Any]:
    """
    Build an NGSIv2 attribute in the standard format.
    
    Args:
        value: Attribute value
        attr_type (str): NGSIv2 attribute type (Text, Number, DateTime, etc.)
    
    Returns:
        dict: Formatted NGSIv2 attribute
    """
    return {
        'type': attr_type,
        'value': value
    }

def batch_upsert_entities(entities: List[Dict[str, Any]]) -> bool:
    """
    Create or update multiple entities in batch operation.
    
    Args:
        entities (list): List of NGSIv2 entity documents
    
    Returns:
        bool: True if all successful, False otherwise
    """
    try:
        url = f"{ORION_URL}/v2/op/update"
        headers = {'Content-Type': 'application/json'}
        
        payload = {
            'actionType': 'APPEND',
            'entities': entities
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 204:
            logger.info(f"Batch upsert completed: {len(entities)} entities")
            return True
        else:
            logger.warning(f"Batch upsert failed ({response.status_code}): {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error in batch upsert: {e}")
        return False

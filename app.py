#!/usr/bin/env python3
"""
FIWARE NGSIv2 Application - Main Flask Application
Manages Orion Context Broker connections, Socket.IO real-time updates,
and Flask route blueprints for entity management.
"""

import os
import logging
from datetime import datetime
from flask import Flask, request
from flask_socketio import SocketIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JSON_SORT_KEYS'] = False

# Initialize Socket.IO with threading (more reliable than eventlet)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ============================================================================
# Orion Configuration
# ============================================================================

ORION_URL = os.getenv('ORION_URL', 'http://localhost:1026')
APP_PORT = int(os.getenv('APP_PORT', 5000))
WEBHOOK_URL_BASE = os.getenv('WEBHOOK_URL_BASE', 'http://host.docker.internal:5000')

logger.info(f"Configuración cargada:")
logger.info(f"  ORION_URL: {ORION_URL}")
logger.info(f"  APP_PORT: {APP_PORT}")
logger.info(f"  WEBHOOK_URL_BASE: {WEBHOOK_URL_BASE}")

# ============================================================================
# Import routes and modules (after app initialization to avoid circular imports)
# ============================================================================

from routes import home, products, stores, employees, notifications
from modules import context_providers, subscriptions

# ============================================================================
# Register blueprints
# ============================================================================

app.register_blueprint(home.bp)
app.register_blueprint(products.bp)
app.register_blueprint(stores.bp)
app.register_blueprint(employees.bp)
app.register_blueprint(notifications.bp)

# ============================================================================
# Application startup - Initialize Orion integration
# ============================================================================

def initialize_orion_integration():
    """Register context providers and subscriptions on application startup."""
    logger.info("=== Inicializando integración con Orion ===")
    
    try:
        # Register context providers (temperature/humidity, tweets)
        logger.info("Registrando proveedores de contexto...")
        context_providers.register_all_providers()
        logger.info("✓ Proveedores registrados correctamente")
    except Exception as e:
        logger.error(f"✗ Error registrando proveedores: {e}")
        # Continue execution even if providers fail
    
    try:
        # Register subscriptions (price_change, low_stock)
        logger.info("Registrando suscripciones...")
        subscriptions.register_all_subscriptions()
        logger.info("✓ Suscripciones registradas correctamente")
    except Exception as e:
        logger.error(f"✗ Error registrando suscripciones: {e}")
        # Continue execution even if subscriptions fail
    
    logger.info("=== Inicialización completada ===")

# Initialize Orion integration on first request
with app.app_context():
    initialize_orion_integration()

# ============================================================================
# Socket.IO event handlers
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info(f"Cliente conectado: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.info(f"Cliente desconectado: {request.sid}")

@socketio.on('get-status')
def handle_status_request():
    """Handle status request from client."""
    return {
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'orion_url': ORION_URL
    }

# ============================================================================
# Health check endpoint
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }, 200

# ============================================================================
# Error handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors."""
    return {
        'error': 'Not Found',
        'message': 'El recurso solicitado no existe'
    }, 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error."""
    logger.error(f"Error interno del servidor: {error}")
    return {
        'error': 'Internal Server Error',
        'message': 'Error interno del servidor'
    }, 500

# ============================================================================
# Main entry point
# ============================================================================

if __name__ == '__main__':
    logger.info("Iniciando servidor Flask con SocketIO...")
    socketio.run(
        app,
        host='0.0.0.0',
        port=APP_PORT,
        debug=False
    )

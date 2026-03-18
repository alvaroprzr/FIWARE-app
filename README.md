# FIWARE Smart Warehouse - Almacén Inteligente

Sistema de gestión de inventario basado en **FIWARE NGSIv2 Context Broker** con interfaz web moderna, visualización 3D y mapas en tiempo real.

## 📋 Características

- **NGSIv2 Context Broker**: Gestión de datos mediante Orion Context Broker
- **5 Entidades Principales**:
  - 🏪 **Store** (Almacenes) - Ubicación, capacidad, clima
  - 📦 **Product** (Productos) - Catálogo con precios
  - 📚 **Shelf** (Estanterías) - Organización dentro de almacenes
  - 👥 **Employee** (Empleados) - Personal con habilidades
  - 🔢 **InventoryItem** (Elementos) - Control de stock

- **Características Frontend**:
  - 🌍 **Mapas interactivos** con Leaflet.js
  - 🎨 **Visualización 3D** de almacenes con Three.js
  - 🌙 **Dark/Light Mode** con CSS variables
  - 🌐 **Internacionalización** (ES/EN)
  - 📡 **Socket.IO** para notificaciones en tiempo real
  - 📊 **Mermaid** diagrama del modelo de datos

- **Backend Flask**:
  - 5 blueprints de rutas (home, products, stores, employees, notifications)
  - Integración NGSIv2 con funciones reutilizables
  - Gestión de proveedores y suscripciones
  - Webhooks para eventos en tiempo real

## 🔧 Requisitos Previos

- `docker` y `docker-compose`
- `python 3.10+`
- `git`

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd FIWARE-app
```

### 2. Crear entorno virtual Python
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar dependencias Python
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo (si existe)
cp .env.example .env

# O crear uno nuevo con:
cat > .env << 'EOF'
# FIWARE Configuration
ORION_URL=http://localhost:1026
TUTORIAL_URL=http://tutorial:3000
WEBHOOK_URL_BASE=http://host.docker.internal:5000

# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py
APP_PORT=5000
SECRET_KEY=your-secret-key-here-change-in-production
EOF
```

⚠️ **Nota**: Usar `host.docker.internal` para webhooks desde contenedores Docker (NO localhost)

## 🚀 Ejecución

### Paso 1: Iniciar contenedores FIWARE
```bash
docker-compose up -d
```

Esperar ~30 segundos a que Orion Context Broker esté listo:
```bash
curl http://localhost:1026/version
```

### Paso 2: Importar datos iniciales
```bash
bash import-data.sh
```

Verificar que se cargaron correctamente:
```bash
curl http://localhost:1026/v2/entities
```

### Paso 3: Instalar y ejecutar aplicación Flask
```bash
source venv/bin/activate  # Si no está activado

# Opción A: Desarrollo
python app.py

# Opción B: Producción con gunicorn
pip install gunicorn
gunicorn --worker-class eventlet -w 1 app:app
```

La aplicación estará disponible en **http://localhost:5000**

## 🏗️ Estructura del Proyecto

```
FIWARE-app/
├── app.py                          # Aplicación Flask principal
├── requirements.txt                # Dependencias Python
├── import-data.sh                  # Script de importación de datos
├── docker-compose.yml              # Configuración Docker
├── .env                            # Variables de entorno
├── .gitignore
├── README.md
│
├── modules/                        # Módulos core
│   ├── __init__.py
│   ├── orion.py                   # Funciones NGSIv2 CRUD
│   ├── context_providers.py       # Registro de proveedores
│   └── subscriptions.py           # Gestión de suscripciones
│
├── routes/                         # Blueprints Flask
│   ├── __init__.py
│   ├── home.py                    # Página de inicio
│   ├── products.py                # Gestión de productos
│   ├── stores.py                  # Gestión de almacenes
│   ├── employees.py               # Gestión de empleados
│   └── notifications.py           # Webhooks de notificaciones
│
├── templates/                      # Plantillas Jinja2
│   ├── base.html                  # Plantilla base con navbar
│   ├── home.html                  # Dashboard
│   ├── products.html              # Listado de productos
│   ├── product_detail.html        # Detalle de producto
│   ├── stores.html                # Listado de almacenes
│   ├── store_detail.html          # Detalle de almacén + mapas
│   ├── stores_map.html            # Mapa global
│   ├── employees.html             # Listado de empleados
│   ├── employee_detail.html       # Detalle de empleado
│   ├── error.html                 # Página de error
│
└── static/                         # Archivos estáticos
    ├── style.css                  # Estilos globales + dark mode
    ├── main.js                    # i18n, socket.io, theme toggle
    ├── store_3d.js                # Visualización Three.js
    └── maps.js                    # Mapas Leaflet
```

## 📚 Estructura de Datos (NGSIv2)

Ver [data_model.md](data_model.md) para especificación completa de entidades.

## 🔔 Notificaciones en Tiempo Real

El sistema dispone de **2 suscripciones** a Orion que envían notificaciones en tiempo real:

1. **Price Change** (`/notify/price-change`) - Cambio de precio de productos
2. **Low Stock** (`/notify/low-stock`) - Stock bajo en estanterías

## 📝 Verificación

- ✅ Backend Flask + SocketIO funcional
- ✅ 5 entidades NGSIv2 cargadas en Orion
- ✅ 2 proveedores de contexto registrados
- ✅ 2 suscripciones configuradas
- ✅ Frontend: 8 vistas + navbar + dark/light mode
- ✅ Mapas Leaflet + Visualización 3D
- ✅ Internacionalización ES/EN
- ✅ Notificaciones en tiempo real

---

**Implementación FIWARE NGSIv2 - Proyecto Completado**

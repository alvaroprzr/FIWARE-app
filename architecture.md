# Arquitectura del Sistema

## 1. Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Navegador)                    │
│  - Interfaz HTML5                                            │
│  - CSS3 + Variables (Dark/Light, i18n)                       │
│  - JavaScript ES6+                                           │
│  - Socket.IO client (escucha eventos tiempo real)            │
│  - Three.js (recorrido 3D)                                   │
│  - Leaflet.js (mapas)                                        │
│  - Mermaid.js (diagrama UML)                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         APLICACIÓN FLASK + FLASK-SocketIO (Puerto 5000)      │
│  - Gestión de rutas HTTP (GET, POST, PATCH, DELETE)         │
│  - WebSocket para notificaciones push (Socket.IO)            │
│  - Blueprint de rutas: home, products, stores, employees    │
│  - Endpoints de notificación: /notify/price-change,         │
│    /notify/low-stock                                         │
│  - Al arrancar: registra providers + suscripciones en Orion  │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
           HTTP requests                  │ (host.docker.internal, NO localhost)
                   │                      │
                   ↓                      ↓
     ┌──────────────────────┐  ┌──────────────────────────┐
     │  Orion Context Broker │  │  webhook callbacks       │
     │  (Puerto 1026, NGSIv2)│  │  (notificaciones)        │
     │  - Entidades         │  │                          │
     │  - Atributos         │  │  Events:                 │
     │  - Relaciones        │  │  - price_change          │
     │  - Subscripciones    │  │  - low_stock             │
     │  - Registrations     │  │                          │
     └──────────┬───────────┘  └──────────────────────────┘
                │
                ├── HTTP requests (NGSIv2 REST)
                │
     ┌──────────────────────────────────┐
     │      MongoDB (repositorio)        │
     │  (Almacena entidades de Orion)    │
     └──────────────────────────────────┘
                │
                └── Registrations de providers externos
                    │
                    ↓
     ┌──────────────────────────────────────┐
     │   FIWARE Tutorial Container          │
     │   (Proveedor de contexto externo)    │
     │   - /api endpoint                    │
     │   - Simula temp, humidity, tweets    │
     └──────────────────────────────────────┘
```

## 2. Componentes Principales y Responsabilidades

### 2.1 Cliente (Navegador Web)

**Responsabilidad:** Presentación interactiva y captura de entrada del usuario.

- Renderiza templates Jinja2 convertidos a HTML.
- Ejecuta JavaScript para:
  - Escuchar eventos Socket.IO (price_change, low_stock).
  - Gestionar i18n y Dark/Light mode.
  - Interacciones de formularios y validaciones.
  - Renderización de mapas (Leaflet.js) y vistas 3D (Three.js).
  - Actualización de DOM sin recarga de página.

**Arquitectura Frontend:**

```
static/
├── css/
│   └── style.css          # Variables CSS, animaciones, temas
├── js/
│   ├── main.js            # Socket.IO, i18n, dark/light, navbar
│   ├── store_3d.js        # Three.js scene
│   └── maps.js            # Leaflet.js maps
└── images/                # Assets (opcional)
```

### 2.2 Servidor Flask + Flask-SocketIO

**Responsabilidad:** Lógica de negocio, orquestación de datos, comunicación tiempo real.

**Rutas principales:**
- GET  / → home
- GET  /products, /products/<id>
- GET  /stores, /stores/<id>, /stores-map
- GET  /employees, /employees/<id>
- POST /notify/price-change → webhook Orion
- POST /notify/low-stock → webhook Orion

**Al arrancar (app.py):**
1. Cargar variables de entorno.
2. Registrar proveedores externos.
3. Registrar suscripciones NGSIv2.
4. Iniciar servidor HTTP/WebSocket.

### 2.3 Orion Context Broker (NGSIv2)

**Responsabilidad:** Almacenamiento y gestión de entidades contextuales.

- Escucha: llamadas CRUD en puerto 1026.
- Ejecuta: registros de proveedores.
- Gestiona: suscripciones que disparan webhooks.
- Devuelve: entidades en formato NGSIv2.

### 2.4 Proveedores de Contexto Externo

**Responsabilidad:** Enriquecer datos de Orion con información externa.

- **Provider 1:** Sensores (temperatura, humedad) → `http://tutorial:3000/api`
- **Provider 2:** Tweets/redes sociales → `http://tutorial:3000/api`

### 2.5 MongoDB

**Responsabilidad:** Persistencia de datos de Orion.

- Almacena colecciones de entidades, atributos, suscripciones.

## 3. Flujo de Datos: Cliente ↔ Flask ↔ Orion ↔ Proveedor Externo

### 3.1 Lectura de datos

```
Cliente GET /stores/store123
  → Flask invoca orion.get_entity()
    → Orion GET /v2/entities/urn:ngsi-ld:Store:store123
      → Orion consulta MongoDB + proveedores externos
        → Devuelve entidad completa con temperature, relativeHumidity, tweets
      → Flask renderiza template
        → Cliente recibe HTML
```

### 3.2 Modificación de datos y notificaciones

```
Usuario compra producto en store_detail
  → JS hace PATCH /v2/entities/urn:ngsi-ld:InventoryItem:item123/attrs
    → Flask valida y ejecuta llamada a Orion
      → Orion actualiza shelfCount, stockCount en MongoDB
        → Orion dispara suscripción "stock bajo" (si shelfCount < 3)
          → Orion POST /notify/low-stock (webhook Flask)
            → Flask emite Socket.IO 'low_stock'
              → Clientes reciben evento y actualizan UI
```

## 4. Flujo de Notificaciones en Tiempo Real

```
Orion detecta cambio en Product.price
  ↓
Orion consulta suscripción matching
  ↓
Orion construye payload y POST /notify/price-change
  ↓
Flask procesa: extrae product_id, new_price
  ↓
Flask emite Socket.IO 'price_change' a todos los clientes
  ↓
Cliente JavaScript escucha en main.js
  ↓
Cliente busca elementos [data-product-id] y actualiza textContent
  ↓
UI reactiva, sin recarga de página
```

## 5. Estructura Completa de Carpetas del Proyecto

```
FIWARE-app/
├── app.py                          # Punto de entrada Flask
├── context_providers.py            # Registro providers
├── subscriptions.py                # Registro suscripciones
├── orion.py                        # Módulo reutilizable NGSIv2
├── routes/
│   ├── __init__.py
│   ├── home.py                     # GET /
│   ├── products.py                 # GET/POST /products
│   ├── stores.py                   # GET/POST /stores
│   ├── employees.py                # GET/POST /employees
│   └── notifications.py            # POST /notify/*
├── templates/
│   ├── base.html                   # Layout base
│   ├── home.html
│   ├── products.html
│   ├── product_detail.html
│   ├── stores.html
│   ├── store_detail.html
│   ├── employees.html
│   ├── employee_detail.html
│   └── stores_map.html
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── store_3d.js
│   │   └── maps.js
│   └── images/
├── import-data.sh
├── docker-compose.yml
├── .env
├── .gitignore
├── requirements.txt
├── README.md
├── PRD.md
├── architecture.md
├── data_model.md
└── AGENTS.md
```

## 5. Notas de Compatibilidad - Orion 4.1.0

### Cambios Significativos (Issue #2)

1. **Tipos de Datos NGSIv2**
   - Cambio: Solo tipo `"Number"` soportado para valores numéricos
   - Antes: Permitía `"Integer"` y `"Number"` como distintos
   - Impacto: Todos los enteros deben declararse como `"Number"` en NGSIv2
   - Ejemplo:
     ```json
     // ❌ INCORRECTO en Orion 4.1.0
     "maxCapacity": {"type": "Integer", "value": 20}
     
     // ✅ CORRECTO en Orion 4.1.0
     "maxCapacity": {"type": "Number", "value": 20}
     ```

2. **Pattern Matching en Providers y Subscriptions**
   - Cambio: Uso exclusivo de `"idPattern"` en lugar de `"isPattern"`
   - Antes: `"isPattern": true` activaba regexp en `id`
   - Ahora: Debe especificarse patrón explícito en `"idPattern": ".*"`
   - Ejemplo:
     ```json
     // ❌ INCORRECTO en Orion 4.1.0
     {"type": "Store", "isPattern": true}
     
     // ✅ CORRECTO en Orion 4.1.0
     {"type": "Store", "idPattern": ".*"}
     ```

### Implementación en FIWARE-app
- ✅ import-data.sh actualizado con tipos NGSIv2 correctos
- ✅ modules/context_providers.py con `idPattern: '.*'`
- ✅ modules/subscriptions.py con `idPattern: '.*'`
- ✅ Todas las entidades (Employee, Store, Product, Shelf, InventoryItem) validadas

---

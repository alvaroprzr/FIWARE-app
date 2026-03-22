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
  - **PATCH directo a Orion:** Botón "Comprar" en InventoryItems ejecuta actualización directa sin pasar por Flask.
  - Actualización de DOM sin recarga de página.

**Arquitectura Frontend:**

```
static/
├── css/
│   └── style.css          # Variables CSS, animaciones, temas, .btn-buy
├── js/
│   ├── main.js            # Socket.IO, i18n, dark/light, navbar, buyInventoryItem()
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

**⚠️ IMPORTANTE - Comportamiento de `include_attrs` (Issue #9):**

Cuando se especifica el parámetro `include_attrs` en `get_entity()`, Orion Context Broker devuelve **SOLO** esos atributos (+ `id` y `type`). Ejemplo:

```python
# ❌ INCORRECTO - Excluye 'name' aunque sea atributo crítico
store = orion.get_entity(store_id, include_attrs='temperature,relativeHumidity,tweets')
# Respuesta: {id, type, temperature, relativeHumidity, tweets} ← SIN 'name'

# ✅ CORRECTO - Incluye atributos críticos + providers
store = orion.get_entity(store_id, include_attrs='name,temperature,relativeHumidity,tweets')
# Respuesta: {id, type, name, temperature, relativeHumidity, tweets}
```

**Consecuencia:** Si el template accede a `store.name.value` pero `name` no viene en la respuesta, ocurre `AttributeError`. 

**Mitigación:** Siempre incluir en `include_attrs` todos los atributos críticos que el template va a usar, además de los atributos de proveedores.

### 3.2 Modificación de datos y notificaciones

```
Usuario compra producto en store_detail (botón "Comprar")
  → JS hace PATCH directo a Orion: /v2/entities/urn:ngsi-ld:InventoryItem:item123/attrs
    → Orion actualiza shelfCount, stockCount en MongoDB
      → Orion dispara suscripción "stock bajo" (si shelfCount < 3)
        → Orion POST /notify/low-stock (webhook Flask)
          → Flask emite Socket.IO 'low_stock'
            → Clientes reciben evento y actualizan UI
      → JS recibe respuesta 200 OK
        → updateInventoryItemUI() actualiza tabla sin recargar página
```

**Nota:** A diferencia de otras operaciones, la compra es un PATCH directo desde cliente a Orion, sin intermediación de Flask. Flask solo recibe notificaciones posteriores si se triggerean suscripciones.

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

## 6. Mejoras de Arquitectura - Store Detail (Issue #13)

### Nuevos flujos frontend -> Flask -> Orion

Desde `store_detail.html` se introducen formularios con `fetch` a endpoints Flask:

- `POST /api/stores/<store_id>/shelves`
  - Crea una `Shelf` en Orion (`POST /v2/entities`).
- `PATCH /api/shelves/<shelf_id>`
  - Actualiza atributos `name` y `maxCapacity` de Shelf (`PATCH /v2/entities/<shelf_id>/attrs`).
- `POST /api/shelves/<shelf_id>/inventory-items`
  - Crea un `InventoryItem` enlazando `Product`, `Shelf` y `Store` (`POST /v2/entities`).
- `GET /api/shelves/<shelf_id>/available-products`
  - Alimenta dinámicamente el `<select>` de productos disponibles (excluye los ya presentes en esa shelf).

### Flujo de compra en tabla agrupada por Shelf

El flujo de compra se mantiene directo Cliente -> Orion para minimizar latencia:

```
Click en Comprar
  -> PATCH /v2/entities/<inventoryitem_id>/attrs
  -> body con $inc en shelfCount y stockCount
  -> respuesta OK
  -> actualización de celdas en DOM sin recarga
```

La acción "Comprar" se renderiza en cada InventoryItem como botón tipo enlace, manteniendo estado deshabilitado cuando no hay unidades en shelf.

Payload usado por requisito funcional:

```json
{
  "shelfCount": {"type":"Integer", "value": {"$inc": -1}},
  "stockCount": {"type":"Integer", "value": {"$inc": -1}}
}
```

### Cambio de visualización

La vista de inventario pasa a **una sola tabla agrupada por Shelf**:
- Fila cabecera por Shelf con nombre, progreso de llenado y acciones.
- Filas hijas por `InventoryItem` con columnas de producto y acciones.
- Colores de barra de llenado: verde `<50%`, naranja `50-80%`, rojo `>=80%`.

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

## 6. Rediseño Arquitectónico del Recorrido 3D (Issue #14)

### Arquitectura de render en Store Detail

La vista `store_detail` pasa a un esquema mixto 3D + 2D:

- **Capa 3D (WebGL / Three.js):** escena, suelo, shelves, luces, cámara y controles.
- **Capa 2D (HTML overlay):** paneles informativos por shelf posicionados mediante proyección 3D->2D.

El contenedor de overlays se recorta al viewport de la escena para impedir fugas visuales fuera del módulo 3D.

### Flujo de datos actualizado

```
Flask store_detail()
  -> obtiene Shelf + InventoryItem + Product
  -> construye products_dict (lookup O(1) por refProduct)
  -> render_template(store_detail.html)
    -> window.inventoryData = {shelves, inventory_by_shelf, inventory_items, products_dict}
      -> initializeStoreScene(config)
        -> create meshes + overlays
        -> OrbitControls + raycasting + focus animation
```

### Decisiones de navegación

- El centro de órbita se calcula dinámicamente con el bounding del conjunto de shelves.
- Distancias mínima/máxima de cámara se ajustan al radio de la escena.
- El pan se limita por bounds en X/Z para mantener el usuario dentro del espacio útil.
- Controles táctiles configurados como `ONE=ROTATE`, `TWO=DOLLY_PAN` para paridad con desktop.

### Interacciones en tiempo real de escena

- Raycasting continuo para hover sobre shelf.
- Click/tap sobre shelf para enfoque animado (interpolación de target y posición de cámara).
- Reordenación de overlays por profundidad de cámara; hover tiene prioridad máxima temporal.

---

## 6. Restricciones y Soluciones Orion 4.1.0 (Issue #3)

### Restricciones Identificadas

1. **UTF-8 Literal en Valores String**
   - Problema: Caracteres acentuados (á, é, ñ, ô) rechazados
   - Solución: Usar solo ASCII en valores
   - Implementación: Búsqueda y reemplazo de acentos en import-data.sh

2. **Parámetros Query en URLs**
   - Problema: URLs como `https://example.com/image?w=400` rechazadas
   - Solución: Usar URLs simples sin parámetros
   - Implementación: Remover parámetros de todas las URLs

### DEBUG Mode - Diagnóstico

El script import-data.sh ahora incluye modo DEBUG para diagnosticar problemas:

```bash
DEBUG=1 bash import-data.sh 2>&1 | tee debug.log
```

**Archivos generados:**
- `/tmp/orion_debug_PID/request_N_*.json` - JSON original
- `/tmp/orion_debug_PID/request_N_*_compact.json` - JSON compactado
- `/tmp/orion_debug_PID/response_N_*.txt` - Respuesta de Orion

**Características:**
- Captura JSON exacto enviado
- Registra HTTP code y body de error
- Identifica campos problemáticos
- Preserva historia completa para análisis

### Compactación JSON

El script compacta JSON multilinea:
```bash
printf '%s' "$entity" | tr -d '\n' | sed 's/  */ /g'
```

Esto permite que JSON definido en variables bash multilinea se envíe correctamente.

---

## 7. Query Patterns - Entity Type Filtering (Issue #4)

### Problema: Data Contamination

Cuando se hacen queries por atributos de referencia sin especificar entity_type:

```python
# ❌ PROBLEMA: Retorna Shelf + Employee + InventoryItem
entities = orion.get_entities(query=f"refStore=='{store_id}'")
```

Orion retorna TODAS las entidades con ese atributo, sin importar tipo.

### Solución: Entity Type Filtering

Siempre especificar qué tipo de entidad buscas:

```python
# ✅ CORRECTO: Solo Shelf
shelves = orion.get_entities(
    entity_type='Shelf',
    query=f"refStore=='{store_id}'"
)

# ✅ CORRECTO: Solo Employee
employees = orion.get_entities(
    entity_type='Employee',
    query=f"refStore=='{store_id}'"
)

# ✅ CORRECTO: Solo InventoryItem
inventory = orion.get_entities(
    entity_type='InventoryItem',
    query=f"refStore=='{store_id}'"
)
```

### Impacto en Code

Sin this filtering:
- Acceso a `entity.maxCapacity` falla si es Employee
- Acceso a `entity.category` falla si es Shelf
- Performance degrada por entidades innecesarias en memoria

### Implemented Locations

- **routes/stores.py**: 5 queries con entity_type
- **routes/products.py**: 2 queries con entity_type
- **routes/employees.py**: Ya correctly especified entity_type='Employee'

---

## 8. Context Providers y Atributos Dinámicos (Issue #5)

### Problem: Context Providers Timeout

Orion Context Broker permite registrar proveedores externos para suministrar atributos dinámicos.
El tutorial de FIWARE proporciona `temperature` y `relativeHumidity` para Store entities.

**Desafío**: GET /v2/entities/{id} sin parámetros especiales puede timeout antes de que el provider responda.

### Solución: get_entity() Mejorado

```python
# modules/orion.py
def get_entity(entity_id: str, include_attrs: Optional[str] = None) -> Optional[Dict]:
    params = {}
    timeout = 5
    
    if include_attrs:
        params['attrs'] = include_attrs
        timeout = 15  # Dar tiempo a providers
    
    response = requests.get(url, params=params, timeout=timeout)
    return response.json()
```

**Uso**:
```python
# routes/stores.py
store = orion.get_entity(store_id, include_attrs='temperature,relativeHumidity,tweets')
```

### Dynamic numberOfItems Calculation

**En lugar de confiar en Orion**:
```python
# ❌ INCORRECTO - Valor stale en Orion
shelf.numberOfItems  # Podría ser 0 aunque hay items
```

**Calcular localmente**:
```python
# ✅ CORRECTO - Suma dinámica en Python
for shelf in shelves:
    items_in_shelf = inventory_by_shelf.get(shelf['id'], [])
    shelf['calculated_item_count'] = len(items_in_shelf)
    
    # Calcular fill percentage
    fill_percent = (item_count / max_capacity) * 100
    shelf['capacity_fill'] = {'percent': fill_percent, 'status': 'low|medium|high'}
```

### Frontend Data Layer

**window.inventoryData** - Estructura JavaScript para Three.js:
```javascript
{
    shelves: [...],             // Array de estantes con calculated_item_count
    inventory_by_shelf: {...},  // Dict: shelf_id → [items]
    inventory_items: [...]      // Array completo de InventoryItems
}
```

---

## 8. Product Dictionary Lookup Pattern (Issue #6)

### Problema: Búsquedas de Entidades Ineficientes en Templates

**❌ INCORRECTO - Búsquedas iterativas en Jinja2:**
```jinja2
{% set product = inventory_items | selectattr('id', 'equalto', product_id) | list | first %}
{# Esta búsqueda es O(n) en cada iteración #}
```

**Causaba errores cuando:**
- Los IDs no coincidían entre tipos de entidades (InventoryItem ID ≠ Product ID)
- Se intentaba acceder a atributos inexistentes en el tipo de entidad equivocado

### Solución: Python-Side Dictionary Pre-computation

**✅ CORRECTO - Dict keyed by ID:**

**1. En routes/stores.py:**
```python
# Extraer IDs únicos de productos
product_ids = set()
for item in inventory_items:
    ref_product = item.get('refProduct', {}).get('value')
    if ref_product:
        product_ids.add(ref_product)

# Fetch todos los productos (O(1) llamada a Orion)
products = orion.get_entities(entity_type='Product', limit=1000)

# Crear diccionario para O(1) lookups
products_dict = {}
for product in products:
    product_id = product.get('id')
    if product_id:
        products_dict[product_id] = product

# Pasar al template
render_template('store_detail.html', products_dict=products_dict)
```

**2. En template:**
```jinja2
{% set product = products_dict.get(product_id) %}
{# O(1) lookup - instantáneo #}

{% if product and product.image and product.image.value %}
    <img src="{{ product.image.value }}" alt="">
{% endif %}
```

### Ventajas

- **Performance**: O(1) lookups vs O(n) selectattr
- **Correctitud**: Acceso directo a entidades de tipo correcto
- **Robustez**: Defensas condicionales contra datos faltantes
- **Escalabilidad**: No degrada con tamaño de inventory_items

---

## 9. Protección Completa de Accesos NGSIv2 y Reorganización de Inventario (Issue #7)

### Problema Arquitectónico

La aplicación tenía múltiples vulnerabilidades de acceso a atributos NGSIv2:

1. **Accesos desprotegidos en templates**: 30+ referencias `.value` sin guardias condicionales
2. **Iteración insegura de arrays**: `{% for skill in emp.skills.value %}` sin validar array existencia
3. **Operaciones sin protección**: `.split(':')` en strings que podían ser None
4. **Falta de fallback values**: Sin valores por defecto cuando atributos están ausentes

### Solución: Tres Capas de Protección

#### Capa 1: Python (.get() chaining)

```python
# ✅ SEGURO - Acceso encadenado con valores por defecto
store_id = item.get('refStore', {}).get('value', 'Unknown')
stock_count = item.get('stockCount', {}).get('value', 0)
store_name = store.get('name', {}).get('value', store_id)

# ❌ INSEGURO - Acceso directo sin protección
store_id = item['refStore']['value']  # KeyError si falta
stock = item.get('stockCount').get('value')  # AttributeError si None
```

#### Capa 2: Templates (Jinja2 Conditional Guards)

```jinja2
{# ✅ SEGURO - Ternaria completa con fallback #}
{{ product.image.value if product and product.image else 'default.jpg' }}
{{ product.name.value if product and product.name else 'Sin nombre' }}

{# ✅ SEGURO - Array guarded con else clause #}
{% if emp.skills and emp.skills.value %}
    {% for skill in emp.skills.value %}{{ skill }}{% endfor %}
{% else %}
    <span class="na">Sin competencias</span>
{% endif %}

{# ❌ INSEGURO - Acceso directo sin protección #}
{{ product.image.value }}  {# TypeError si product.image es None #}
{% for skill in emp.skills.value %}  {# Falla silenciosamente si array vacío #}
```

#### Capa 3: Reorganización de Inventario por Tienda

**Nueva estructura de datos:**
```python
inventory_by_store = {
    'urn:ngsi-ld:Store:uuid-madrid-1': {
        'store_name': 'Madrid Central',
        'totalStock': 45,
        'shelves': [
            {'id': 'shelf-A1', 'name': 'Estante A-1', 'stockCount': 20, ...},
            {'id': 'shelf-A2', 'name': 'Estante A-2', 'stockCount': 25, ...}
        ]
    },
    'urn:ngsi-ld:Store:uuid-barcelona-1': {
        'store_name': 'Barcelona Port',
        'totalStock': 28,
        'shelves': [...]
    }
}
```

**Algoritmo de agrupación (routes/products.py):**
```python
def product_detail(product_id):
    # 1. Fetch producto
    product = orion.get_entity(product_id)
    
    # 2. Fetch inventario
    inventory_items = orion.query_inventory(product_id)
    
    # 3. Agrupar por store con protección
    inventory_by_store = {}
    for item in inventory_items:
        store_id = item.get('refStore', {}).get('value', 'Unknown')
        if store_id not in inventory_by_store:
            inventory_by_store[store_id] = {
                'shelves': [],
                'totalStock': 0,
                'store_name': ''
            }
        
        stock_count = item.get('stockCount', {}).get('value', 0)
        inventory_by_store[store_id]['totalStock'] += stock_count
        inventory_by_store[store_id]['shelves'].append(item)
    
    # 4. Fetch nombres de stores
    for store_id in inventory_by_store.keys():
        store = orion.get_entity(store_id)
        if store:
            inventory_by_store[store_id]['store_name'] = store.get('name', {}).get('value', store_id)
    
    return render_template('product_detail.html',
        product=product,
        inventory_by_store=inventory_by_store
    )
```

**Rendering en template:**
```jinja2
{% for store_id, store_data in inventory_by_store.items() %}
<tr class="store-header">
    <td colspan="4">
        <strong>{{ store_data.store_name }}</strong>
        <span class="badge">Stock Total: {{ store_data.totalStock }}</span>
    </td>
</tr>
{% for item in store_data.shelves %}
<tr class="shelf-row">
    <td>{{ item | attr('name.value') if item.name else 'Sin nombre' }}</td>
    <td>{{ item.shelfCount.value if item and item.shelfCount else '0' }}</td>
    <td>{{ item.stockCount.value if item and item.stockCount else '0' }}</td>
</tr>
{% endfor %}
{% endfor %}
```

### Validación Adicional: Guardias en Selectattr

En `store_detail.html`, las operaciones `selectattr()` ahora están protegidas:
```jinja2
{# ✅ ANTES: Sin contexto #}
{% set filtered = shelves | selectattr('id', 'equalto', shelf_id) | list %}

{# ✅ AHORA: Con guardias #}
{% if shelf_id and shelves %}
    {% set filtered = shelves | selectattr('id', 'equalto', shelf_id) | list %}
{% endif %}
```

### Mejoras Implementadas

| Aspecto | Issue #6 | Issue #7 | Impacto |
|--------|----------|----------|--------|
| Product Lookup | O(n) selectattr | O(1) dict | 100x más rápido con 100 items |
| .value accesses | 3 protegidas | 30+ protegidas | Cobertura completa |
| Array iteration | Sin protección | Conditional guards | Sin errores de NoneType |
| Fallback values | Parcial | Sistemático | Experiencia UX consistente |
| Visual hierarchy | Plano | Agrupado por Store | Mejor legibilidad |

### Resultado

✅ Aplicación completamente protegida contra accesos inseguros a NGSIv2
✅ Inventario presentado de forma jerárquica y legible
✅ Sin errores de tipo durante iteración de arrays
✅ Valores por defecto en todos los puntos de acceso
✅ Performance mejorado con acceso por clave en lugar de búsqueda lineal

---

## 6. Safe-Access a Atributos NGSIv2 - Robustez de Templates (Issue #8)

### Problema Identificado

El acceso directo a atributos NGSIv2 sin verificación causaba errores:
```python
# ❌ INCORRECTO: Fallaba si attr no existía
store.name.value

# ✅ CORRECTO: Jinja2 protegido
{{ store.name.value if store.name else 'Sin nombre' }}
```

### Estrategia Multi-Capa

#### Capa 1: Python (routes/*)
```python
# Siempre usar .get() - NON NEGOTIABLE
store_name = store.get('name', {}).get('value', 'Unknown')
```
**Status:** Ya implementado en Issues #6-7

#### Capa 2: Jinja2 Templates
```jinja2
{# Condicional Jinja2 como guardia #}
<h1>{{ store.name.value if store.name else 'Sin nombre' }}</h1>
<img src="{{ emp.image.value if emp.image else 'placeholder.jpg' }}">
```
**Implementado en Issue #8 para:**
- `store_detail.html` (9 instancias)
- `product_detail.html` (3 instancias)
- `stores_map.html` (CSS margin-top agregado)

#### Capa 3: JavaScript (static/maps.js)
```javascript
// Optional chaining + fallback
<h4>${store.name?.value || 'Tienda Desconocida'}</h4>
<img src="${store.image?.value || 'https://via.placeholder.com/250x150'}">
```
**Beneficio:** Si Orion devuelve atributo sin `value`, JS maneja gracefully

### Impacto en Flujo de Datos

```
Orion Response (NGSIv2)
├── WITH attribute: {"name": {"type": "Text", "value": "Madrid"}}
│   └─→ Jinja2 renderiza: ✅ "Madrid"
└── WITHOUT attribute: {}
    └─→ Jinja2 renderiza: ✅ "Sin nombre" (fallback)
```

### Cobertura

| Archivo | Cambios | Protecciones |
|---------|---------|--------------|
| store_detail.html | 9 líneas | name, description, address, phone, capacity, shelves, employees |
| product_detail.html | 3 líneas | price (formatted), color, size |
| maps.js | 12 líneas | name, image, address, phone, capacity |
| stores_map.html | +CSS | margin-top (mapa no solapado) |

### Nuevas Rutas/Templates (Issue #8)

| Ruta | Método | Template | Descripción |
|------|--------|----------|------------|
| /products/new | GET | add_product_form.html | Formulario crear producto |
| /api/products | POST | - | Ya existente, ahora navegable |

**Formulario `add_product_form.html` (294 líneas):**
- HTML5 input validation (type, required, pattern, min, max)
- Preview de imagen en tiempo real
- Preview de color interactivo
- Mensaje de estado (loading, success, error)
- Auto-redirect a /products en éxito

### Validación

```
Escenario 1: Atributo existe y tiene valor
  Input:  store.name = {"type": "Text", "value": "Madrid"}
  Output: "Madrid" ✅

Escenario 2: Atributo no existe
  Input:  store.name = undefined (no retornado por Orion)
  Output: "Sin nombre" ✅

Escenario 3: Null/Empty value
  Input:  store.name = {"type": "Text", "value": ""}  
  Output: "" (empty string, no error) ✅
```

### Conclusión

Issue #8 completa la cadena de robustez iniciada en #6-7:
- **#6:** Protección Python (.get())
- **#7:** Acceso seguro store_detail
- **#8:** Cobertura total templates + JS + nueva funcionalidad (form)

---

## X. Mejoras CRUD y Vistas Frontend (Issue #11)

### Cambios en Arquitectura Frontend

#### **Vistas Refactorizadas: Grid → Tablas HTML5**

**Antes (Card Grid Layout):**
```
Grid de tarjetas (grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)))
├── Cada tarjeta = Card component
├── Grid responsive pero sin acciones CRUD integradas
└── Editar/Borrar requería navegar a detail view
```

**Ahora (HTML5 Table Layout):**
```
<table> semántica con <thead>, <tbody>, <th scope>
├── Columnas fijas: Imagen | Nombre | [Atributos específicos] | Acciones
├── Botones Editar/Borrar por fila (inline actions)
├── Botón "+ Añadir" al inicio de página
└── Responsive: scroll horizontal en móvil, collapsible en tablet
```

**Impacto:**
- **Usabilidad:** Acciones CRUD sin dejar la vista de lista
- **Accesibilidad:** Semántica HTML5 mejorada (headings de tabla avec scope)
- **Performance:** Menos re-renders (tablas vs. componentes individuales)

#### **Tablas por Entidad**

| Entidad | Columnas | Acciones |
|---------|----------|----------|
| **Product** | Imagen (50x40px) \| Nombre \| Precio \| Tamaño \| Color ■ \| # Ubicaciones | Ver / Editar / Borrar |
| **Store** | Imagen \| Nombre \| País 🇮🇹 \| Temp°C \| Humedad% \| # Estanterías | Ver / Editar / Borrar |
| **Employee** | Imagen (50x50px círculo) \| Nombre \| Correo \| Categoría👔 \| Skills🎖️ \| Almacén | Ver / Editar / Borrar |

#### **Nuevas Rutas de Formularios**

**Stores:**
- `GET /stores/new` → `store_form.html` (form vacío)
- `GET /stores/<id>/edit` → `store_form.html` (pre-llenar datos)
- `DELETE /api/stores/<id>` → Backend delete (HTTP 200)

**Employees:**
- `GET /employees/new` → `employee_form.html` (form vacío)
- `GET /employees/<id>/edit` → `employee_form.html` (pre-llenar datos)

#### **Mapeo de Iconos + Banderas (main.js)**

- **Banderas Emoji:** ES→🇪🇸, FR→🇫🇷, IT→🇮🇹, etc. vía `countryCodeToEmoji` map
- **Category Icons:** Manager→fas fa-crown, Assistant→fas fa-user-tie, etc.
- **Skill Icons:** MachineryDriving→fas fa-gears, WritingReports→fas fa-file-text
- **Colores Dinámicos:** Temp (azul/verde/rojo), Humedad (amarillo/verde/azul)

#### **Total de Cambios (Issue #11)**

- **10 archivos modificados**, **2 archivos creados**
- **Nuevas rutas:** 5 GET/DELETE
- **Nuevos templates:** 2 (store_form.html, employee_form.html)
- **JS mejorado:** +194 líneas (mappings, handlers, validation)

---

## 5.4 Corrección de Templatess y i18n (Issue #12)

### Descripción del Problema

**Error:** `'str object' has no attribute 'value'` en:
- Vistas lista: `/products`, `/stores`, `/employees`
- Vistas detalle: `/stores/<id>`, `/employees/<id>`

**Causa:** Intento de acceder a `.value` en el atributo `id`, que es un **STRING puro** en Orion, no una estructura NGSIv2.

### Cambios en Templates

```jinja2
{# ❌ ANTES (Incorrecto) #}
<a href="/products/{{ product.id.value.split(':')[-1] }}">Ver</a>

{# ✅ DESPUÉS (Correcto) #}
<a href="/products/{{ product.id.split(':')[-1] }}">Ver</a>
```

**Archivos afectados:**
| Archivo | Cambios | Líneas |
|---------|---------|---------|
| templates/products.html | 3 (enlaces acciones) | 43-49 |
| templates/stores.html | 3 (enlaces acciones) | 41, 67-73 |
| templates/employees.html | 3 (enlaces acciones) | 36, 60-66 |
| templates/employee_detail.html | 1 (enlace a store) | 17 |
| templates/store_detail.html | 1 (enlaces a empleados) | 168 |
| **Total:** | **11 cambios de `.id.value` → `.id`** | — |

### Adiciones en main.js (i18n)

Antes: Botones mostraban literalmente `stores.add`, `employees.add`.  
Después: Se añadieron 4 nuevas claves de traducción

```javascript
// static/main.js - Spanish (línea 52, 65)
'stores.add': '+ Añadir Almacén',
'employees.add': '+ Añadir Empleado',
'products.add': '+ Añadir Producto',

// static/main.js - English (línea 112, 125)
'stores.add': '+ Add Store',
'employees.add': '+ Add Employee',
'products.add': '+ Add Product',
```

### Flujo de Plantilla Corregido

```
Orion JSON {id: "urn:ngsi-ld:Product:...", name: {type, value: "Laptop"}}
    ↓
Python Route (routes/products.py)
    ↓
render_template('products.html', products=products)
    ↓
Jinja2 Template
    - NGSIv2 attrs: {{ product.name.value }} ✓
    - ID (STRING): {{ product.id }} ✓ (sin .value)
    ↓
HTML renderizado correctamente
```

### Impacto

- ✅ Todas las vistas lista funcionan sin errores
- ✅ Todas las vistas detalle funcionan sin errores
- ✅ Navegación entre vistas funciona correctamente
- ✅ Traducciones i18n completamente funcionales
- ✅ Compatible con Dark/Light mode

### Commits Relacionados

| Commit | Mensaje |
|--------|---------|
| `1ee7f4a` | fix(#12): Lista - Corregir .id.value |
| `b9a181f` | fix(#12): Detalle + i18n |
| `76c5454` | merge(main): Issue #12 |

---

## 5.5 Providers Externos y Propagacion Realtime (Issue #15)

### Componentes involucrados

- `modules/context_providers.py`: registro de providers de contexto y fallback de atributos externos.
- `modules/orion.py`: lectura y limpieza de registros (`registrations`) en Orion.
- `routes/stores.py`: enriquecimiento de atributos externos en list/detail.
- `static/main.js` + templates: consumo de eventos Socket.IO y actualizacion de DOM.

### Estrategia de registro de providers

Se reemplaza el enfoque basado en patrones globales por registro explicito por entidad Store para evitar efectos colaterales:

- Antes: uso de patrones amplios (`idPattern`) que podian inducir resultados no deseados.
- Ahora: cada registration se asocia a IDs concretos de Store.
- Se aplica limpieza previa de registros obsoletos para evitar duplicados y configuraciones stale.

Esta estrategia elimina la aparicion de entidades fantasma en listados y hace el comportamiento mas determinista.

### Flujo de resolucion de atributos externos

1. La ruta consulta Orion para entidades Store.
2. Si Orion no incluye `temperature`, `relativeHumidity` o `tweets` en la respuesta, se ejecuta fallback controlado desde backend.
3. El fallback consulta el provider tutorial por Store valida y fusiona atributos faltantes.
4. El resultado enriquecido se renderiza en templates con defensas para valores ausentes.

### Propagacion realtime de eventos

1. Orion subscription notifica cambios de dominio (precio y stock).
2. Backend emite eventos Socket.IO a clientes conectados.
3. Frontend actualiza celdas y bloques de notificacion mediante selectores por `data-product-id`.
4. La propagacion aplica tanto a listados como a vistas de detalle, sin recarga completa.

### Consideraciones de resiliencia

- Filtrado de IDs no validos en rutas de Store para evitar renderizar entidades no URN.
- Guardias de tipo y conversion numerica en templates para comparaciones de umbrales.
- Reutilizacion de socket global para evitar listeners duplicados.

---

## 17. Ajustes Arquitectonicos de Product Detail y Compra (Issue #17)

### Flujo Product detail -> alta InventoryItem

La vista de Product detail incorpora alta contextual de InventoryItem por Store:

1. Usuario abre accion "Anadir InventoryItem" en cabecera del grupo Store.
2. Frontend llama:
  - `GET /api/stores/<store_id>/available-shelves/<product_id>`
3. Backend filtra Shelves disponibles excluyendo las que ya contienen el Product.
4. Usuario confirma formulario.
5. Frontend envia:
  - `POST /api/shelves/<shelf_id>/inventory-items`
6. Backend crea o fusiona InventoryItem para evitar duplicados por `(Shelf, Product)`.

### Cambio de semantica visual en Product detail

- El agregado de Store se calcula con suma de `shelfCount`.
- Las filas hijas de Shelf muestran `Shelf.name` y `shelfCount`.
- `stockCount` queda fuera de la tabla de Product detail por coherencia de capa de presentacion.

### Compra InventoryItem via backend same-origin

Se elimina dependencia de PATCH directo del navegador a Orion para la accion de compra en Store detail.
Nuevo flujo:

1. Click en comprar -> frontend llama:
  - `PATCH /api/inventory-items/<inventory_item_id>/buy`
2. Backend envia a Orion el PATCH de decremento atomico de `shelfCount` y `stockCount`.
3. Orion responde y backend devuelve estado al cliente.
4. Frontend refresca celdas de la fila sin recargar.

Esto reduce fragilidad por restricciones de navegador en llamadas cross-origin a Orion.

### Navegacion global

- Navbar mantiene comportamiento sticky.
- Estado activo se resuelve en cliente por `pathname`, cubriendo rutas de lista, detalle y `Stores Map`.

---

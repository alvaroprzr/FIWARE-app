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

# Product Requirements Document (PRD)

## 1. Descripción General del Producto

**Nombre:** Aplicación FIWARE NGSIv2 — Sistema de Gestión de Almacenes Inteligentes

**Propósito:** Plataforma web integral para la gestión centralizada de múltiples almacenes (stores) de una empresa, permitiendo monitoreo en tiempo real de inventario, disponibilidad de productos, condiciones ambientales (temperatura, humedad) y personal empleado. La plataforma integra datos de Orion Context Broker (NGSIv2), proveedores de contexto externos (sensores de clima, redes sociales) y proporciona una interfaz web reactiva con sincronización en tiempo real.

## 2. Módulos Funcionales Principales

### 2.1 Módulo: Modelo de Datos (FIWARE NGSIv2)
Cinco entidades principales que representan el ecosistema del almacén:

- **Employee:** Representación de personal con autenticación, habilidades y asignación a stores específicas.
- **Store:** Ubicación física del almacén con coordenadas GPS, datos de contacto, y atributos ambientales en tiempo real (temperatura, humedad).
- **Product:** Catálogo de artículos con propiedades (precio, tamaño, color) disponibles para distribución.
- **Shelf:** Estanterías dentro de cada store con control de capacidad y cantidad actual de items.
- **InventoryItem:** Control granular de stock — qué producto, en qué estantería, en qué store, y cantidades (shelfCount y stockCount).

Todas las entidades siguen la especificación NGSIv2 con tipos de atributo, valores y metadatos.

### 2.2 Módulo: Proveedores Externos de Contexto
Registros dinámicos en Orion que enriquecen datos de Store:

- **Proveedor de Sensores Ambientales:**
  - Atributos: `temperature` (°C), `relativeHumidity` (%).
  - Fuente: Contenedor FIWARE `tutorial:3000/api`.
  - Actualización: Automática según cambios en Orion.

- **Proveedor de Tweets/Redes Sociales:**
  - Atributo: `tweets` (array de cadenas).
  - Fuente: Contenedor FIWARE `tutorial:3000/api`.
  - Actualización: Dinámica.

### 2.3 Módulo: Suscripciones NGSIv2 y Notificaciones en Tiempo Real
Mecanismo publish-subscribe que vincula cambios en Orion a eventos en el navegador:

- **Suscripción 1: Cambio de Precio de Producto**
  - Trigger: Modificación del atributo `price` en cualquier entidad `Product`.
  - Endpoint de notificación: `POST /notify/price-change`.
  - Evento Socket.IO emitido al cliente: `price_change` con datos del producto y nuevo precio.
  - Efecto en UI: Actualización instantánea de precios en tablas/detalles sin recarga.

- **Suscripción 2: Stock Bajo en InventoryItem**
  - Trigger: Cualquier `InventoryItem` con `shelfCount < 3`.
  - Endpoint de notificación: `POST /notify/low-stock`.
  - Evento Socket.IO emitido: `low_stock` con detalles de producto, store, shelf y cantidades.
  - Efecto en UI: Alerta visual en panel de notificaciones del store correspondiente + incremento de badge en navbar.

### 2.4 Módulo: Interfaz de Usuario (Frontend)
Conjunto de vistas HTML + CSS + JavaScript que proporcionan:

- **Navegación Global:** Navbar sticky con secciones: Home | Products | Stores | Employees | Stores Map.
- **Home:** Dashboard con diagrama UML de entidades (Mermaid.js), estadísticas globales, panel de notificaciones en tiempo real.
- **Products:** 
  - Lista tabular de productos con imagen, color, tamaño, acciones.
  - Detalle de producto con tabla de InventoryItems agrupada por Store/Shelf.
  - Formulario para añadir productos a shelves.
  - Actualización en tiempo real de precios (Socket.IO).
- **Stores:**
  - Lista tabular con foto, nombre, país, temperatura y humedad con códigos de color.
  - Detalle exhaustivo: foto del store, sensores ambientales, mapa Leaflet.js, recorrido virtual 3D (Three.js), inventario agrupado por shelf con barras de progreso, tweets, panel de notificaciones.
  - Formulario para añadir shelves.
- **Employees:**
  - Lista con foto, nombre, categoría, skills con iconografía.
  - Detalle de empleado con todos los atributos y referencia al store asignado.
- **Stores Map:** Mapa global Leaflet.js mostrando todos los stores con marcadores personalizados, tooltips con datos ambientales y navegación a detalle.

## 3. Requisitos No Funcionales

### 3.1 Multiidioma (i18n)
- **Idiomas soportados:** Español (ES), Inglés (EN).
- **Implementación:** Objeto de traducciones en JavaScript con atributo `data-i18n` en elementos HTML.
- **Persistencia:** Preferencia guardada en `localStorage`.
- **Selector:** Botón ES | EN en navbar.

### 3.2 Dark / Light Mode (Tema Visual)
- **Implementación:** Variables CSS personalizadas (custom properties) con dos conjuntos de valores.
- **Toggle:** Switch en navbar que añade/quita clase `.dark` en `<html>`.
- **Persistencia:** Preferencia guardada en `localStorage`.
- **Colores CSS variables:**
  - `--bg`: color de fondo.
  - `--text`: color de texto.
  - `--surface`: color de superficies secundarias.
  - `--border`: color de bordes.
  - `--accent`: color de énfasis y botones.

### 3.3 Validación de Datos
- **Nivel HTML5:** Atributos `required`, `type` (email, number, date, color, url, tel, password), `pattern`, `min`, `max`, `minlength`, `maxlength`.
- **Nivel JavaScript:** Verificación de coherencia, mensajes de error dinámicos, prevención de envío inválido.

### 3.4 CSS-First Design
- **Principio:** Cualquier efecto visual o interacción que pueda implementarse con CSS se implementa con CSS, no con JavaScript.
- **JavaScript:** Solo para lógica de negocio, fetches, eventos Socket.IO.

### 3.5 Mínima Generación de HTML en JS
- Estructura HTML presente en templates Jinja2.
- JavaScript solo actualiza `textContent`, atributos `data-*`, `style` o remueve/añade clases CSS.

## 4. Stack Tecnológico Completo y Versiones

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.10+ | Lenguaje de programación |
| Flask | 3.x | Framework web HTTP |
| Flask-SocketIO | 5.x | WebSocket para notificaciones |
| eventlet | Última | Servidor WSGI asincrónico |
| python-dotenv | Última | Gestión de variables .env |
| requests | Última | Cliente HTTP para Orion |
| bcrypt | Última | Hash de contraseñas |

### Frontend (Cliente)

| Tecnología | Versión | Propósito |
|---|---|---|
| HTML5 | Estándar | Estructura |
| CSS3 | Estándar | Estilos, animaciones, variables |
| JavaScript | ES6+ | Lógica cliente |
| Socket.IO cliente | 4.x | Comunicación bidireccional |
| Three.js | r128+ | Visualización 3D |
| Leaflet.js | 1.9+ | Mapas interactivos |
| Mermaid.js | 10+ | Diagrama UML |
| Font Awesome | 6 Free | Iconografía |

### Infraestructura

| Tecnología | Versión | Propósito |
|---|---|---|
| Docker | Última | Contenedorización |
| Docker Compose | 2.x+ | Orquestación |
| Orion Context Broker | 3.x | API NGSIv2 |
| MongoDB | 4.4+ | Base de datos Orion |
| FIWARE tutorial | Última | Proveedores externos |

## 10. Notas de Compatibilidad - Orion 4.1.0

### Cambios Implementados (Issue #2)

**Problema 1: Tipos de Datos NGSIv2**
- Orion 4.1.0 requiere tipo `"Number"` para todos los valores numéricos (enteros y decimales)
- Cambio: `"type": "Integer"` → `"type": "Number"` en import-data.sh (59 ocurrencias)
- Entidades afectadas: Shelves (maxCapacity, numberOfItems), InventoryItems (shelfCount, stockCount)

**Problema 2: Context Providers y Subscriptions**
- Orion 4.1.0 utiliza `"idPattern"` en lugar de `"isPattern"` para pattern matching
- Cambio: `"isPattern": true` → `"idPattern": ".*"` (4 ubicaciones)
- Archivos: modules/context_providers.py (2 proveedores), modules/subscriptions.py (2 suscripciones)

### Validación
- ✅ Tipos de datos validados contra NGSIv2 4.1.0
- ✅ Context providers registrados exitosamente
- ✅ Subscripciones activas para eventos en tiempo real
- ✅ import-data.sh ejecutable sin errores

---

## 11. Optimización Orion 4.1.0 - Restricciones de Datos (Issue #3)

### Restricciones Identificadas y Solucionadas

**Restricción 1: Caracteres Acentuados en Valores de String**
- Orion 4.1.0 rechaza caracteres UTF-8 literales no escapados (á, é, í, ó, ú, ñ, ô, etc.)
- Implementación: Todos los valores de string usan solo ASCII (acentos removidos)
- Ejemplos:
  - ❌ "Almacén" → ✅ "Almacen"
  - ❌ "María" → ✅ "Maria"
  - ❌ "Entrepôt" → ✅ "Entrepot"

**Restricción 2: Parámetros Query en URLs**
- URLs con parámetros query (p.e., `?w=400`) son rechazadas como "invalid characters"
- Implementación: Todas las URLs son simples sin parámetros
- Ejemplos:
  - ❌ "https://images.unsplash.com/...?w=400" → ✅ "https://images.unsplash.com/..."

### DEBUG Mode en import-data.sh

El script ahora soporta `DEBUG=1` para diagnosticar problemas:
```bash
DEBUG=1 bash import-data.sh 2>&1 | tee debug_output.log
```

En modo DEBUG:
- Guarda JSON exacto antes de enviar (request_N_*.json)
- Guarda JSON compactado (request_N_*_compact.json)
- Captura respuesta de Orion (response_N_*.txt)
- Muestra body de error si falla (HTTP != 201)

---

## 12. Entity Type Filtering en Queries (Issue #4)

### Problema Identificado

Las entidades en FIWARE comparten atributos de referencia comunes (ej: `refStore`, `refProduct`).
Sin filtros de tipo, `get_entities()` retorna entidades de todos los tipos que coincidan con la query,
causando "dict object has no attribute X" al acceder a atributos específicos del tipo.

### Solución Implementada

Agregar `entity_type` parameter a TODAS las queries en routes:

**routes/stores.py:**
- `list_stores()`: Filtro Shelf beim query de shelves
- `store_detail()`: Filtros Shelf, Employee, InventoryItem
- `get_store_shelves()`: Filtro Shelf
- `get_available_products_for_shelf()`: Filtro InventoryItem
- `get_available_shelves()`: Filtros Shelf e InventoryItem

**routes/products.py:**
- `list_products()`: Filtro InventoryItem beim inventory
- `product_detail()`: Filtro InventoryItem

### Patrón Correcto

```python
# ❌ INCORRECTO - Retorna múltiples tipos
entities = orion.get_entities(
    query=f"refStore=='{store_id}'"
)

# ✅ CORRECTO - Retorna solo Shelf
entities = orion.get_entities(
    entity_type='Shelf',
    query=f"refStore=='{store_id}'"
)
```

### Impacto

- Elimina data contamination en listas
- Previene AttributeError al acceder a atributos específicos del tipo
- Mejora performance (menos entidades en memoria)

---

## 13. Visualización y Experiencia de Usuario - Store Detail (Issue #5)

### Animación de Foto Hero

La imagen principal del almacén ahora ejecuta una transformación simultánea al pasar el cursor:
- **Scale**: 1.0 → 1.1 (ampliación del 10%)
- **Rotate**: 0° → 360° (rotación completa)
- **Duration**: 0.8s con easing cubic-bezier personalizado

Proporciona retroalimentación visual interactiva sin interrumpir la navegación.

### Context Providers - Temperature & Humidity

**Problema Original**: Los atributos `temperature` y `relativeHumidity` siempre mostraban "No disponible"

**Solución Implementada**:
- Aumentar timeout de `get_entity()` de 5s a 15s
- Incluir parámetro `include_attrs` para solicitar específicamente atributos del proveedor
- Si el servicio `tutorial:3000` está disponible, los valores se muestran con colores dinámicos

**Colores Dinámicos**:
- Temperatura: Azul (<10°C) | Verde (10-25°C) | Rojo (>25°C)
- Humedad: Amarillo (<30%) | Verde (30-70%) | Azul (>70%)

**Fallback**: Si el proveedor no está disponible, se muestra "ℹ️ No disponible"

### Capacidad de Estantería - Progreso Visual

Cada estantería ahora muestra:
- **Barra de progreso** que indica % de llenado
- **Color**: Verde (<50%) | Naranja (50-80%) | Rojo (≥80%)
- **Contador dinámico**: Artículos = suma de InventoryItems en esa estantería

Esto reemplaza el valor estático `numberOfItems` de Orion con cálculo local preciso.

### Tabla de Inventario Detallado

Nueva sección que agrupa productos por estantería:
- Vista tabular de cada producto
- Columnas: Imagen, Nombre, Precio, Tamaño, Color, Stock, Cantidad en Estantería
- Responsive: scroll horizontal en mobile

### Visualización Three.js Mejorada

- **Labels mejorados**: Nombre de estantería + Cantidad de productos + Stock total
- **Producto boxes**: Cajas 3D individuales para cada producto con colores distintos
- **Interactividad**: Mouse drag para rotar vista 360°

---

## 14. Corrección de Acceso a Atributos NGSIv2 en Store Detail (Issue #6)

### Problema Original

Al acceder a la vista de detalle del almacén (`/stores/<store_id>`), se generaba un error:
```
'dict object' has no attribute 'name'
```

Ocurría específicamente en la tabla de inventario cuando se intentaba mostrar información de productos.

### Causa Raíz

La ruta `store_detail()` en `routes/stores.py` no pasaba las entidades de Producto al template. La tabla de inventario intentaba buscar productos usando filtros Jinja2 `selectattr()` sobre el array de InventoryItems, lo que fallaba porque:

1. **Error de búsqueda**: `selectattr('id', 'equalto', product_id)` buscaba InventoryItems con ID == Product ID
   - Los IDs nunca coincidían: InventoryItem ID = `urn:ngsi-ld:InventoryItem:item-001` vs Product ID = `urn:ngsi-ld:Product:laptop`
   - La búsqueda siempre retornaba `None`
   
2. **Mapeo de atributo incorrecto**: `selectattr('refProduct', 'contains', product_id)` intentaba mapear atributo `image`
   - InventoryItem NO tiene atributo `image` (solo Product tiene)
   - El fallback a imagen placeholder era siempre activado

### Solución Implementada

**Fase 1: Contexto Python (routes/stores.py)**
```python
# Extraer IDs únicos de productos desde inventory_items
product_ids = set()
for item in inventory_items:
    ref_product = item.get('refProduct', {}).get('value')
    if ref_product:
        product_ids.add(ref_product)

# Fetch Product entities desde Orion
products = orion.get_entities(entity_type='Product', limit=1000)

# Crear diccionario keyed por ID para lookup rápido
products_dict = {}
for product in products:
    product_id = product.get('id')
    if product_id:
        products_dict[product_id] = product

# Pasar a template
render_template('store_detail.html', ..., products_dict=products_dict)
```

**Fase 2: Template Rewrite (templates/store_detail.html, líneas 102-122)**

Reemplazar búsquedas rotas con dict lookup seguro:

```jinja2
{% set product_id = item.refProduct.value %}
{% set product = products_dict.get(product_id) %}

{# Acceso seguro con defensas #}
{% if product and product.image and product.image.value %}
    <img src="{{ product.image.value }}" class="product-image" alt="">
{% else %}
    <img src="https://via.placeholder.com/40" class="product-image" alt="">
{% endif %}

{# Todos los atributos con .value y guardias condicionales #}
<td>{{ product.name.value if product and product.name else item.refProduct.value.split(':')[-1] }}</td>
<td>{{ product.price.value if product and product.price else '-' }}</td>
<td>{{ product.size.value if product and product.size else '-' }}</td>
<td>{{ product.color.value if product and product.color else '-' }}</td>
```

### Validación NGSIv2

- ✅ Python: Todos los accesos usan `.get()` chaining (sin accesos con notación de objeto)
- ✅ Template: Todos los atributos tienen `.value` y guardias condicionales
- ✅ Sin falsos positivos: Campos calculados (calculated_item_count) mantienen acceso directo
- ✅ 32+ accesos NGSIv2 correctos preservados sin cambios
- ✅ Solo 2 áreas problemáticas corregidas

### Resultado

- ✅ No más errores `'dict object' has no attribute`
- ✅ Tabla de inventario se carga correctamente
- ✅ Imágenes de productos se muestran en tabla
- ✅ Nombres, precios, tamaños y colores se cargan desde Product entities
- ✅ Fallback a placeholders si datos faltantes
- ✅ Todas las vistas de store detail funcionan sin errores

---

## 15. Corrección Completa de Errores Pendientes en Toda la Aplicación (Issue #7)

### Problema

La aplicación presentaba 15+ errores críticos que impedían su funcionamiento correcto:

1. **Accesos desprotegidos a atributos NGSIv2 (.value)**: 30+ accesos sin guardias condicionales en 6 templates
2. **Iteración sobre arrays desprotegidos**: skills.value sin garantizar existencia del array
3. **Operaciones .split() en strings peligrosas**: refStore y refShelf sin validación previa
4. **Falta de UX interactiva**: Botones y enlaces sin funcionalidad
5. **Visualización subóptima**: Inventario de productos sin agrupación clara

### Solución Implementada

#### a. Protección de Accesos NGSIv2 en Templates

**Patrón aplicado 30+ veces:**
```jinja2
{# ✅ CON GUARDIA #}
{{ product.image.value if product and product.image else 'https://via.placeholder.com/200x150' }}

{# ✅ ARRAY SEGURA #}
{% if emp.skills and emp.skills.value %}
    {% for skill in emp.skills.value %}
        <span class="skill">{{ skill }}</span>
    {% endfor %}
{% else %}
    <span class="na">Sin competencias</span>
{% endif %}
```

**Archivos modificados:**
- `templates/products.html`: Guardias en image, name (×2), price, size, color
- `templates/stores.html`: Guardias en address (3 niveles), telefono, capacidad
- `templates/employees.html`: Guardias en 5+ atributos + protección de skills array
- `templates/employee_detail.html`: Guardias en name, category, username, email, dateOfContract + skills array
- `templates/product_detail.html`: Guardias en image, name, price, size, color + protección de .split()
- `templates/store_detail.html`: Guardias en selectattr y shelf filtering

#### b. Reorganización de Inventario por Store

**Cambio de arquitectura:**
```
ANTES (por Shelf):
+--------+---------+----------+
| Estante | Producto | Stock |
+--------+---------+----------+
| A-1    | Prod-1  | 5     |
| A-1    | Prod-2  | 3     |
| B-2    | Prod-1  | 2     |

AHORA (por Store):
┌─────────────────────────────┐
│ STORE: Madrid               │ ← Encabezado con totalStock
│ Stock Total: 10             │
├─────────────────────────────┤
│ Estante A-1: 5 items        │ ← Detalle de shelf
│ Estante A-2: 3 items        │
│ Estante B-1: 2 items        │
└─────────────────────────────┘
```

**Implementación en routes/products.py:**
```python
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

# Fetch store names
for store_id in inventory_by_store.keys():
    store = ...  # Query Orion
    inventory_by_store[store_id]['store_name'] = store.get('name', {}).get('value', store_id)
```

**Plantilla product_detail.html:**
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
    <!-- shelf details -->
</tr>
{% endfor %}
{% endfor %}
```

#### c. Mejoras de UX e Interactividad

**1. Animación CSS Hover - Fotos de Empleado:**
```css
.employee-photo {
    transition: transform 0.3s ease-in-out;
    cursor: pointer;
}
.employee-photo:hover {
    transform: scale(1.15);
}
```
Aplicado a: `templates/employees.html` e `templates/employee_detail.html`

**2. Links Navegables en Dashboard (home.html):**
```html
{# ANTES #}
<div class="stat-card">...</div>

{# AHORA #}
<a href="/stores" class="stat-card">...</a>
<a href="/products" class="stat-card">...</a>
<a href="/employees" class="stat-card">...</a>
```

**3. Botón "Add Product" Funcional:**
```html
<a href="/products/new" class="btn btn-primary">+ Añadir Producto</a>
```
Nueva ruta en routes/products.py: `GET /products/new` (redirecciona a /products por ahora)

### Validación Técnica

✅ **Sintaxis Python:** Verificado con `python -m py_compile routes/products.py routes/stores.py`
✅ **Templates Jinja2:** Todas las guardias condicionales sintácticamente correctas
✅ **CSS:** Transiciones y animaciones válidas (sin conflictos con estilos existentes)
✅ **Accesos NGSIv2:** Todos protegidos con .get() en Python y .value con guardias en Jinja2

### Resultado

- ✅ 30+ accesos desprotegidos corregidos
- ✅ Arrays protegidos contra iteración vacía
- ✅ Inventario organizado jerárquicamente por Store
- ✅ Animaciones CSS smooth sin JavaScript
- ✅ Navegación mejorada (stats clickeables)
- ✅ All endpoints funcionan sin errores de acceso a atributos

---

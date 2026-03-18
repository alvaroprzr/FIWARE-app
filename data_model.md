# Modelo de Datos NGSIv2

Especificación completa de todas las entidades FIWARE NGSIv2 y sus atributos.

## 1. Entidad: Employee

Información de personal con autenticación, cualificaciones y asignación a un Store.

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `id` | String | Identificador único |
| `type` | `"Employee"` | Tipo de entidad |
| `name` | `Text` | Nombre completo |
| `email` | `Text` | Correo electrónico único |
| `dateOfContract` | `DateTime` | Fecha ISO 8601 |
| `skills` | `Array` | ["MachineryDriving", "WritingReports", "CustomerRelationships"] |
| `username` | `Text` | Nombre de usuario único |
| `password` | `Text` | Hash bcrypt (costo mínimo 12) |
| `category` | `Text` | Categoría/rol |
| `refStore` | `Relationship` | Referencia a Store (URN) |
| `image` | `Text` | URL foto pública |

**Restricciones:**
- Cada Employee pertenece a UN único Store (1:N Store→Employee)
- email y username únicos globalmente
- password SIEMPRE hasheada con bcrypt
- dateOfContract es obligatoria, fecha válida pasada/presente

---

## 2. Entidad: Store

Ubicación física de almacén con datos de contacto e integración con proveedores.

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `id` | String | Identificador único |
| `type` | `"Store"` | Tipo de entidad |
| `name` | `Text` | Nombre del almacén |
| `url` | `Text` | URL sitio web |
| `telephone` | `Text` | Número teléfono |
| `countryCode` | `Text` | Código ISO 2 caracteres (ES, FR, IT) |
| `capacity` | `Number` | Capacidad en m³ |
| `description` | `Text` | Descripción amplia |
| `address` | `StructuredValue` | Objeto JSON con dirección |
| `location` | `geo:json` | GeoJSON Point [lon, lat] |
| `temperature` | `Number` | °C [PROVEEDOR EXTERNO] |
| `relativeHumidity` | `Number` | Porcentaje [PROVEEDOR EXTERNO] |
| `tweets` | `Array` | Array cadenas [PROVEEDOR EXTERNO] |
| `image` | `Text` | URL foto almacén |

**Restricciones:**
- countryCode EXACTAMENTE 2 caracteres [A-Za-z]
- location GeoJSON Point válido WGS84
- address es objeto JSON estructurado
- temperature, relativeHumidity, tweets PROPORCIONADOS por proveedores (NO modificar desde cliente)
- capacity positivo

---

## 3. Entidad: Product

Artículo disponible para venta y distribución.

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `id` | String | Identificador único |
| `type` | `"Product"` | Tipo |
| `name` | `Text` | Nombre producto |
| `price` | `Number` | Precio euros (decimal) |
| `size` | `Text` | Talla (S, M, L, XL) |
| `color` | `Text` | Hexadecimal #RRGGBB |
| `image` | `Text` | URL imagen producto |

**Restricciones:**
- price POSITIVO y > 0
- color hexadecimal válido (#000000 a #FFFFFF)
- NO referencia directa a Store (a través de InventoryItem)

---

## 4. Entidad: Shelf

Estantería dentro de almacén.

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `id` | String | Identificador único |
| `type` | `"Shelf"` | Tipo |
| `name` | `Text` | Nombre/código |
| `maxCapacity` | `Integer` | Capacidad máxima |
| `numberOfItems` | `Integer` | Items actuales |
| `refStore` | `Relationship` | Referencia Store (URN) |

**Restricciones:**
- maxCapacity POSITIVO (5-50 típico)
- numberOfItems ≤ maxCapacity SIEMPRE
- numberOfItems = suma de shelfCount de todos los InventoryItems en esta Shelf
- Una Shelf → UN único Store (N:1)
- Una Shelf ← múltiples InventoryItems (1:N)

---

## 5. Entidad: InventoryItem

Control granular: qué producto, en qué estantería, en qué tienda, cantidades.

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `id` | String | Identificador único |
| `type` | `"InventoryItem"` | Tipo |
| `refProduct` | `Relationship` | Referencia Product (URN) |
| `refShelf` | `Relationship` | Referencia Shelf (URN) |
| `refStore` | `Relationship` | Referencia Store (URN) |
| `shelfCount` | `Integer` | Unidades EN ESA ESTANTERÍA |
| `stockCount` | `Integer` | Total unidades EN ESE STORE |

**Restricciones - Coherencia de Cantidades:**
- shelfCount ≥ 0
- stockCount ≥ 0
- shelfCount ≤ stockCount SIEMPRE
- stockCount = suma todos shelfCount para (Product, Store)

**Restricciones - Relaciones:**
- Cada InventoryItem → UN Product, UNA Shelf, UN Store
- La Shelf debe pertenecer al Store (coherencia referencial)

**Suscripción Stock Bajo:**
- Si shelfCount < 3 → dispara notificación
- Incluye Product, Store, Shelf y cantidades

**REQUISITO CRÍTICO:**
- Cada Shelf DEBE contener MÍNIMO 4 Products distintos
- (Validar en import-data.sh)

---

## 6. Diagrama UML (Mermaid erDiagram)

\`\`\`mermaid
erDiagram
  Store ||--o{ Employee : "employs"
  Store ||--o{ Shelf : "contains"
  Store ||--o{ InventoryItem : "stocks"
  Product ||--o{ InventoryItem : "is-in"
  Shelf ||--o{ InventoryItem : "stores"

  Employee {
    string id PK
    string name
    string email UK
    datetime dateOfContract
    array skills
    string username UK
    string password
    string category
    string refStore FK
    string image
  }

  Store {
    string id PK
    string name
    string url
    string telephone
    string countryCode
    number capacity
    string description
    object address
    object location
    number temperature
    number relativeHumidity
    array tweets
    string image
  }

  Product {
    string id PK
    string name
    number price
    string size
    string color
    string image
  }

  Shelf {
    string id PK
    string name
    integer maxCapacity
    integer numberOfItems
    string refStore FK
  }

  InventoryItem {
    string id PK
    string refProduct FK
    string refShelf FK
    string refStore FK
    integer shelfCount
    integer stockCount
  }
\`\`\`

---

## 7. Tipos NGSIv2 Utilizados

- **Text:** cadenas (`name`, `email`, etc.)
- **Number:** decimales (`price`, `temperature`)
- **Integer:** enteros (`maxCapacity`, `shelfCount`)
- **DateTime:** ISO 8601 (`dateOfContract`)
- **Array:** listas (`skills`, `tweets`)
- **Relationship:** referencias URN (`refStore`, `refProduct`)
- **StructuredValue:** JSON embebido (`address`)
- **geo:json:** GeoJSON Point (`location`)

---

## 8. Relaciones entre Entidades (Resumen)

| Relación | Cardinalidad |
|---|---|
| Store → Employee | 1:N |
| Store → Shelf | 1:N |
| Store → InventoryItem | 1:N |
| Product → InventoryItem | 1:N |
| Shelf → InventoryItem | 1:N |

---

## 9. Compatibilidad Orion 4.1.0 - Actualización de Tipos de Datos

En respuesta a Issue #2, el modelo de datos ha sido actualizado para compatibilidad total con Orion Context Broker 4.1.0.

### Cambios Principales

**Tipos de Datos (Issue #2)**
- Todos los valores numéricos usan `"type": "Number"` (no más `"Integer"`)
- Esto afecta principalmente a atributos como:
  - `maxCapacity` (Shelf)
  - `numberOfItems` (Shelf)
  - `shelfCount` (InventoryItem)
  - `stockCount` (InventoryItem)
  - `capacity` (Store)
  - `price` (Product)

**Pattern Matching en Providers/Subscriptions**
- Cambio de `"isPattern": true` a `"idPattern": ".*"`
- Esto permite que los proveedores de contexto y las suscripciones funcionen correctamente con todas las entidades

### Validación de Tipos
| Atributo | Tipo NGSIv2 (4.1.0) | Descripción |
|---|---|---|
| `price` | `Number` | Precio en euros |
| `shelfCount` | `Number` | Cantidad en estantería |
| `stockCount` | `Number` | Cantidad en almacén |
| `capacity` | `Number` | Capacidad en metros cúbicos |
| `maxCapacity` | `Number` | Capacidad máxima de estantería |
| `numberOfItems` | `Number` | Número de items actuales |
| `temperature` | `Number` | Temperatura en Celsius |
| `relativeHumidity` | `Number` | Porcentaje de humedad |

---

## 10. Restricciones Prácticas - Orion 4.1.0 (Issue #3)

### Valores de String - Solo ASCII

**Restricción:** Orion 4.1.0 rechaza caracteres acentuados en valores.

**Ejemplos:**
```json
// ❌ RECHAZADO - HTTP 400 "Invalid characters"
{
  "name": { "value": "María", "type": "Text" },      // Acentuado
  "address": { "value": "Almacén", "type": "Text" }  // Acentuado
}

// ✅ ACEPTADO - HTTP 422 (o 201 si no exista)
{
  "name": { "value": "Maria", "type": "Text" },      // ASCII
  "address": { "value": "Almacen", "type": "Text" }  // ASCII
}
```

**Mapeo de caracteres españoles:**
| Carácter | Reemplazo |
|----------|-----------|
| á | a |
| é | e |
| í | i |
| ó | o |
| ú | u |
| ñ | n |
| ô | o |
| ü | u |
| ç | c |

### URLs - Sin parámetros Query

**Restricción:** URLs con parámetros (`?param=value`) rechazadas.

**Ejemplos:**
```json
// ❌ RECHAZADO - HTTP 400 "Invalid characters"
{
  "image": { 
    "value": "https://images.unsplash.com/photo-123?w=400&q=80",
    "type": "URL"
  }
}

// ✅ ACEPTADO - HTTP 422 (o 201 si no exista)
{
  "image": { 
    "value": "https://images.unsplash.com/photo-123",
    "type": "URL"
  }
}
```

### Otras Restricciones Observadas

1. **Type "Integer" → "Number"**
   - Orion 4.1.0 usa "Number" para valores numéricos
   - Cambiar todos los "Integer" a "Number"

2. **Pattern Matching: "isPattern" → "idPattern"**
   - Orion 4.1.0 usa "idPattern": ".*" en lugar de "isPattern": true
   - Cambiar en context_providers y subscriptions

### Validación de Datos

Use DEBUG mode para validar nuevos datos:

```bash
# 1. Crear archivo JSON correctamente formado
cat > new_data.json << 'JSON'
{
  "id": "Store:001",
  "type": "Store",
  "name": { "value": "Nueva Tienda", "type": "Text" },
  "image": { "value": "https://example.com/store.jpg", "type": "URL" }
}
JSON

# 2. Ejecutar con DEBUG=1 para capturar errores
DEBUG=1 curl -H "Content-Type: application/json" \
  -d @new_data.json \
  http://localhost:1026/v2/entities

# 3. Revisar /tmp/orion_debug_*/response_*.txt para detalles de error
```

---

## 11. Query Examples - Correct Entity Type Usage (Issue #4)

### Store Queries

**Obtener SOLO estantes de un store:**
```python
# ✅ CORRECTO
shelves = orion.get_entities(
    entity_type='Shelf',
    query=f"refStore=='{store_id}'"
)

# ❌ INCORRECTO - Retorna Shelf + Employee + InventoryItem
shelves = orion.get_entities(
    query=f"refStore=='{store_id}'"
)
```

**Obtener SOLO empleados de un store:**
```python
# ✅ CORRECTO
employees = orion.get_entities(
    entity_type='Employee',
    query=f"refStore=='{store_id}'"
)
```

### Product Queries

**Obtener SOLO items de inventario de un producto:**
```python
# ✅ CORRECTO
items = orion.get_entities(
    entity_type='InventoryItem',
    query=f"refProduct=='{product_id}'"
)

# ❌ INCORRECTO - Retorna potencialmente otras entidades
items = orion.get_entities(
    query=f"refProduct=='{product_id}'"
)
```

### Shelf Queries

**Obtener SOLO items de inventario en una estantería:**
```python
# ✅ CORRECTO
items = orion.get_entities(
    entity_type='InventoryItem',
    query=f"refShelf=='{shelf_id}'"
)
```

### Best Practices

1. **SIEMPRE usar entity_type** cuando hagas queries por referencias
2. **Combinar entity_type + query** para máxima precisión
3. **Documentar qué tipo esperas** en comentarios
4. **Test con DEBUG mode** cuando agregues nuevas queries

### Common Mistakes

| Mistake | Impact |
|---------|--------|
| Query sin entity_type | 'dict object' has no attribute errors |
| Asumir atributo existe | KeyError si tipo es incorrecto |
| No usar .get() | Mismo problema anterior |
| Queries sin limit | Alto uso de memoria en Orion |

---

## 12. UI/UX Visualización - Store Detail View (Issue #5)

### Dynamic Capacity Visualization

Cada Shelf muestra barra de progreso basada en fill percentage:

```
Status  | Fill%   | RGB Color | Meaning
--------|---------|-----------|--------
low     | 0-50%   | #34a853   | Verde - Mucho espacio
medium  | 50-80%  | #fbbc04   | Naranja - Capaci normal
high    | 80-100% | #ea4335   | Rojo - Casi lleno
```

**Cálculo**:
```javascript
filled_items = len(inventory_items where refShelf == shelf_id)
fill_percent = (filled_items / shelf.maxCapacity) * 100
```

**En Template**:
```html
<div class="capacity-bar {{ shelf.capacity_fill.status }}" 
     style="width: {{ shelf.capacity_fill.percent }}%"></div>
```

### Hero Image Animation

```css
.store-detail-hero:hover img {
    transform: scale(1.1) rotate(360deg);
    transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Resultado**: Rotation y Scale ocurren SIMULTANEAMENTE (no secuencial)

### Temperature/Humidity Color Coding

```
Attribute   | Class          | Range      | Color
------------|----------------|------------|--------
temperature | cold           | < 10°C     | #4285f4 (azul)
temperature | normal         | 10-25°C    | #34a853 (verde)
temperature | hot            | > 25°C     | #ea4335 (rojo)
humidity    | humidity-low   | < 30%      | #fbbc04 (amarillo)
humidity    | normal         | 30-70%     | #34a853 (verde)
humidity    | humidity-high  | > 70%      | #4285f4 (azul)
```

### Three.js Inventory Labels

Cada estantería muestra Canvas texture con:
```
Example:
┌──────────────────────────┐
│  Estantería A1           │
│  Productos: 5            │
│  Stock: 23               │
└──────────────────────────┘
```

**Generado con Canvas 2D**, convertido a THREE.CanvasTexture con tint color #1f73db

### Responsive Considerations

| Viewport | Change |
|----------|--------|
| < 600px  | Hero image apilado (no grid 2 col) |
| < 600px  | Inventory table scroll horizontal |
| < 600px  | Three.js canvas altura reducida |
| < 600px  | Employees list: full width items |

---

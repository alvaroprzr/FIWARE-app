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

# PROMPT AGENTE — Práctica 2: Aplicación FIWARE mejorada (versión final)

---

## ROL Y OBJETIVO

Actúa como un **ingeniero de software senior especializado en FIWARE NGSIv2, Flask, Docker y desarrollo full-stack**. Tu objetivo es **implementar completamente una aplicación web funcional** cumpliendo todos y cada uno de los requisitos descritos en este documento. El resultado debe ser ejecutable, coherente, completo y correctamente integrado. No omitas ninguna funcionalidad. No simplifiques ningún requisito. No dependas de iteraciones posteriores salvo corrección de errores.

---

## RESTRICCIONES IMPORTANTES (leer antes de empezar)

- **No simplificar** ningún requisito por considerarlo complejo o secundario.
- **No omitir** ninguna funcionalidad descrita, por pequeña que parezca.
- **No usar `localhost`** en las URLs de callback hacia Orion. Usar siempre `host.docker.internal`.
- **No simular datos externos**: usar los proveedores de contexto reales del entorno Docker.
- **No romper compatibilidad** con FIWARE NGSIv2.
- **No generar HTML dinámicamente desde JS** salvo cuando sea estrictamente inevitable.
- **No usar gradientes, librerías CSS externas no indicadas** ni componentes que no estén especificados.
- Cada bloque de trabajo debe seguir estrictamente el flujo **GitHub Flow** descrito en la Parte 1.
- Actualizar siempre `PRD.md`, `architecture.md` y `data_model.md` tras completar cada issue.

---

## RESULTADO ESPERADO (checklist de autoevaluación final)

Antes de terminar, verifica que el resultado incluye:

- [ ] Backend Flask completamente funcional con Flask-SocketIO.
- [ ] Todas las entidades NGSIv2 correctamente definidas y cargadas en Orion.
- [ ] Proveedores de contexto externos registrados al arrancar.
- [ ] Suscripciones NGSIv2 registradas al arrancar (con `host.docker.internal`).
- [ ] Notificaciones en tiempo real funcionando (Orion → Flask → Socket.IO → browser).
- [ ] Frontend completo con todas las vistas descritas.
- [ ] Multiidioma (español e inglés) operativo.
- [ ] Toggle Dark/Light operativo.
- [ ] Formularios con validación HTML5 y JS.
- [ ] Mapa Leaflet en vista Store y en vista Stores Map.
- [ ] Recorrido virtual 3D con Three.js en vista Store.
- [ ] Diagrama UML Mermaid renderizado en Home.
- [ ] Script de datos iniciales ejecutable y coherente.
- [ ] GitHub Flow aplicado: issues, ramas, commits, merges.
- [ ] `PRD.md`, `architecture.md`, `data_model.md`, `AGENTS.md` actualizados.
- [ ] `README.md` con instrucciones completas de ejecución.
- [ ] `requirements.txt` generado con `pip freeze`.
- [ ] `.gitignore` excluyendo `.venv/` y `__pycache__/`.

---

## REQUISITOS DE CALIDAD

La implementación debe:

- Ser completamente funcional y ejecutable sin modificaciones manuales.
- Mantener integridad referencial entre todas las entidades NGSIv2.
- Manejar errores HTTP y de red correctamente (try/catch, códigos de estado).
- Tener una UI clara, reactiva y visualmente consistente.
- Minimizar duplicación de código (usar plantillas Jinja2, funciones reutilizables).
- Ser escalable: añadir nuevas entidades o vistas no debe romper la estructura.
- Separar responsabilidades: rutas, lógica de negocio, acceso a Orion y templates bien diferenciados.

---

## PARTE 0 — DOCUMENTACIÓN PREVIA AL CÓDIGO

Antes de escribir ningún archivo de código, genera los siguientes documentos en la raíz del proyecto:

### `PRD.md` — Product Requirements Document
Incluye:
- Descripción general del producto y su propósito.
- Lista completa de funcionalidades por módulo: modelo de datos, proveedores externos, suscripciones/notificaciones, interfaz de usuario.
- Requisitos no funcionales: multiidioma, Dark/Light, validación, CSS-first.
- Stack tecnológico: Flask, Flask-SocketIO, NGSIv2 (Orion), Three.js, Leaflet.js, Font Awesome, Socket.IO cliente, Mermaid.js.

### `architecture.md` — Arquitectura del sistema
Incluye:
- Diagrama de arquitectura de alto nivel (componentes: navegador, Flask, Orion, proveedores externos, Docker).
- Descripción de cada componente y sus responsabilidades.
- Flujo de datos: cliente ↔ Flask ↔ Orion ↔ proveedor externo.
- Flujo de notificaciones: Orion → Flask webhook → Flask-SocketIO → Socket.IO cliente.
- Estructura de carpetas del proyecto (árbol completo).

### `data_model.md` — Modelo de datos
Especificación completa de todas las entidades NGSIv2 con atributos, tipos NGSIv2 y descripción. Ver Parte 3.

### `AGENTS.md` — Instrucciones para el agente
Incluye:
- Recordatorio: actualizar `PRD.md`, `architecture.md` y `data_model.md` tras cada issue.
- Convenciones de nombres, estilo de código, principios de UI.
- Stack tecnológico y versiones.
- Instrucciones sobre el flujo GitHub Flow obligatorio.

---

## PARTE 1 — FLUJO DE TRABAJO GITHUB FLOW (obligatorio para cada issue)

Cada unidad de trabajo debe seguir estos pasos en orden:

1. **Planificación (modo Plan):** elabora un plan de implementación detallado del issue.
2. **Crear issue:** crea un issue en el repositorio remoto GitHub con el contenido completo del plan.
3. **Crear rama:** crea una rama `git` con nombre descriptivo vinculada al issue (ej: `feature/modelo-datos-ampliado`).
4. **Implementar:** escribe el código necesario.
5. **Commit + Push:** confirma los cambios con mensaje descriptivo y sube la rama al repositorio remoto.
6. **Merge y cierre:** fusiona la rama a `main` (o crea una Pull Request si no eres propietario del repo), cierra el issue y sincroniza `origin/main`.
7. **Actualizar documentación:** actualiza `PRD.md`, `architecture.md` y `data_model.md` para reflejar lo implementado.

---

## PARTE 2 — CONTEXTO DE PARTIDA

Ya existe un proyecto base con los siguientes archivos del tutorial FIWARE NGSIv2 Subscriptions. **Extiende este proyecto, no lo rehaga.**

```
docker-compose.yml
.env
services/
import-data/
```

---

## PARTE 3 — MODELO DE DATOS NGSI v2 (central y obligatorio)

Todos los atributos deben incluir `type` y `value` conforme a la especificación NGSIv2. Refléjalos íntegramente en `data_model.md`.

### 3.1 Entidad `Employee`

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `name` | `Text` | Nombre completo |
| `email` | `Text` | Correo electrónico |
| `dateOfContract` | `DateTime` | Fecha de contratación (ISO 8601) |
| `skills` | `Array` | Lista de habilidades: `"MachineryDriving"`, `"WritingReports"`, `"CustomerRelationships"` |
| `username` | `Text` | Nombre de usuario |
| `password` | `Text` | Contraseña (almacenada con hash bcrypt) |
| `category` | `Text` | Categoría del empleado |
| `refStore` | `Relationship` | Referencia al único `Store` donde trabaja |
| `image` | `Text` | URL de la imagen del empleado |

### 3.2 Entidad `Store`

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `name` | `Text` | Nombre de la tienda |
| `url` | `Text` | URL del sitio web |
| `telephone` | `Text` | Número de teléfono |
| `countryCode` | `Text` | Código ISO de país, exactamente 2 caracteres (ej: `"ES"`) |
| `capacity` | `Number` | Capacidad en metros cúbicos |
| `description` | `Text` | Descripción amplia de la tienda |
| `address` | `StructuredValue` | Dirección postal (objeto JSON) |
| `location` | `geo:json` | Coordenadas GPS (GeoJSON Point) |
| `temperature` | `Number` | Temperatura en °C — **proveedor externo** |
| `relativeHumidity` | `Number` | Humedad relativa en % — **proveedor externo** |
| `tweets` | `Array` | Lista de tweets — **proveedor externo** |
| `image` | `Text` | URL de la imagen del almacén |

### 3.3 Entidad `Product`

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `name` | `Text` | Nombre del producto |
| `price` | `Number` | Precio en euros |
| `size` | `Text` | Talla o tamaño (ej: `"S"`, `"M"`, `"L"`) |
| `color` | `Text` | Color en formato RGB hexadecimal (ej: `"#FF5733"`) |
| `image` | `Text` | URL de la imagen del producto |

### 3.4 Entidad `Shelf`

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `name` | `Text` | Nombre de la estantería |
| `maxCapacity` | `Integer` | Capacidad máxima (número de ítems) |
| `numberOfItems` | `Integer` | Número actual de ítems almacenados |
| `refStore` | `Relationship` | Referencia al `Store` que contiene esta estantería |

### 3.5 Entidad `InventoryItem`

| Atributo | Tipo NGSIv2 | Descripción |
|---|---|---|
| `refProduct` | `Relationship` | Referencia al `Product` |
| `refShelf` | `Relationship` | Referencia a la `Shelf` |
| `refStore` | `Relationship` | Referencia al `Store` |
| `shelfCount` | `Integer` | Unidades de ese producto en esa estantería |
| `stockCount` | `Integer` | Total de unidades de ese producto en ese Store |

### 3.6 Diagrama UML de entidades

Genera el diagrama UML completo usando la sintaxis **Mermaid** (`erDiagram`) incluyendo todas las entidades, atributos y relaciones. Renderízalo en la vista **Home** con Mermaid.js (CDN).

---

## PARTE 4 — SCRIPT DE DATOS INICIALES

Crea `import-data.sh` (basado en el `import-data` del tutorial) que cargue en Orion mediante peticiones `POST /v2/entities`:

- **4 Stores** con todos los atributos del modelo. Usa coordenadas GPS reales de 4 ciudades europeas distintas. Incluye imágenes de almacenes disponibles públicamente (Unsplash, Wikimedia Commons o URLs directas de imágenes libres).
- **4 Shelves por Store** (16 en total) con `maxCapacity` entre 10 y 20 y `numberOfItems` coherente.
- **4 Employees**, uno asignado a cada Store, con diferentes combinaciones de `skills`. Incluye imágenes de personas de dominio público.
- **10 Products** con atributos completos incluyendo `color` en hexadecimal. Incluye imágenes de productos libres de derechos.
- **InventoryItems** suficientes para garantizar que **cada Shelf contenga al menos 4 Products distintos**. Los valores de `shelfCount` y `stockCount` deben ser coherentes y positivos. `stockCount` de un producto en un Store = suma de `shelfCount` de ese producto en todas las Shelves de ese Store.

---

## PARTE 5 — ESTRUCTURA DEL PROYECTO

```
project/
├── app.py                    # Flask + SocketIO, arranque, registro providers y suscripciones
├── context_providers.py      # Registro de proveedores externos en Orion
├── subscriptions.py          # Registro de suscripciones NGSIv2 en Orion
├── orion.py                  # Funciones reutilizables para llamadas a la API NGSIv2
├── routes/
│   ├── __init__.py
│   ├── home.py
│   ├── products.py
│   ├── stores.py
│   ├── employees.py
│   └── notifications.py      # Endpoints POST /notify/*
├── templates/
│   ├── base.html             # Navbar, i18n, dark/light toggle, Socket.IO
│   ├── home.html             # Diagrama Mermaid + estadísticas
│   ├── products.html         # Lista de productos
│   ├── product_detail.html   # Detalle de producto + inventario por Store
│   ├── stores.html           # Lista de tiendas
│   ├── store_detail.html     # Detalle de tienda (mapa, 3D, inventario, tweets, notif.)
│   ├── employees.html        # Lista de empleados
│   ├── employee_detail.html  # Detalle de empleado
│   └── stores_map.html       # Mapa global de tiendas
├── static/
│   ├── css/
│   │   └── style.css         # Variables CSS, dark/light, animaciones, barras progreso
│   ├── js/
│   │   ├── main.js           # Socket.IO, i18n, dark/light toggle, navbar
│   │   ├── store_3d.js       # Three.js: recorrido virtual
│   │   └── maps.js           # Leaflet.js: mapa individual y mapa global
│   └── images/               # Imágenes locales si se usan
├── import-data.sh
├── docker-compose.yml
├── .env
├── requirements.txt
├── README.md
├── PRD.md
├── architecture.md
├── data_model.md
├── AGENTS.md
└── .gitignore
```

---

## PARTE 6 — BACKEND FLASK

### Configuración general

- Variables de entorno en `.env`:
  - `ORION_URL=http://localhost:1026`
  - `APP_PORT=5000`
  - `SECRET_KEY=<cadena segura>`
- Al arrancar (`app.py`), ejecutar en orden:
  1. Registrar proveedores de contexto externos (`context_providers.py`).
  2. Registrar suscripciones NGSIv2 (`subscriptions.py`).
- Usar `Flask-SocketIO` con `async_mode='eventlet'` o `'gevent'`.
- Modularizar rutas con `Blueprint`.

### Módulo `orion.py`

Implementa funciones reutilizables:

```python
def get_entity(entity_id, attrs=None): ...
def get_entities(entity_type, query=None, attrs=None): ...
def create_entity(entity): ...
def update_attrs(entity_id, attrs): ...
def delete_entity(entity_id): ...
def register_provider(registration_body): ...
def create_subscription(subscription_body): ...
```

### `.gitignore`

```
.venv/
__pycache__/
*.pyc
*.pyo
.env
*.sqlite
```

---

## PARTE 7 — PROVEEDORES DE CONTEXTO EXTERNO

Al arrancar, registra en Orion los dos proveedores usando `POST /v2/registrations`. Ambos apuntan a la aplicación del contenedor `tutorial` del tutorial FIWARE Context Providers.

### Proveedor 1: Temperatura y Humedad Relativa

```json
{
  "description": "Proveedor de temperatura y humedad",
  "dataProvided": {
    "entities": [{"idPattern": ".*", "type": "Store"}],
    "attrs": ["temperature", "relativeHumidity"]
  },
  "provider": {
    "http": {"url": "http://tutorial:3000/api"},
    "legacyForwarding": true
  }
}
```

### Proveedor 2: Tweets

```json
{
  "description": "Proveedor de tweets",
  "dataProvided": {
    "entities": [{"idPattern": ".*", "type": "Store"}],
    "attrs": ["tweets"]
  },
  "provider": {
    "http": {"url": "http://tutorial:3000/api"},
    "legacyForwarding": true
  }
}
```

---

## PARTE 8 — SUSCRIPCIONES NGSI v2

Al arrancar, registra en Orion las siguientes suscripciones con `POST /v2/subscriptions`. Usar `host.docker.internal` en lugar de `localhost` en todas las URLs de notificación porque Orion corre en Docker.

### Suscripción 1: Cambio de precio de Product

```json
{
  "description": "Notificación de cambio de precio",
  "subject": {
    "entities": [{"idPattern": ".*", "type": "Product"}],
    "condition": {"attrs": ["price"]}
  },
  "notification": {
    "http": {"url": "http://host.docker.internal:5000/notify/price-change"},
    "attrs": ["name", "price"]
  }
}
```

### Suscripción 2: Stock bajo de Product en Store

```json
{
  "description": "Notificación de stock bajo",
  "subject": {
    "entities": [{"idPattern": ".*", "type": "InventoryItem"}],
    "condition": {
      "attrs": ["shelfCount"],
      "expression": {"q": "shelfCount<3"}
    }
  },
  "notification": {
    "http": {"url": "http://host.docker.internal:5000/notify/low-stock"},
    "attrs": ["refProduct", "refStore", "refShelf", "shelfCount", "stockCount"]
  }
}
```

### Endpoints Flask (`routes/notifications.py`)

```
POST /notify/price-change   → procesa payload, emite evento Socket.IO 'price_change'
POST /notify/low-stock      → procesa payload, emite evento Socket.IO 'low_stock'
```

**Payload Socket.IO `price_change`:**

```json
{"product_id": "...", "product_name": "...", "new_price": 9.99}
```

**Payload Socket.IO `low_stock`:**

```json
{
  "product_id": "...", "product_name": "...",
  "store_id": "...", "store_name": "...",
  "shelf_id": "...", "shelf_name": "...",
  "shelfCount": 2
}
```

---

## PARTE 9 — FRONTEND: PRINCIPIOS GLOBALES

### CSS-first

Cuando algo pueda hacerse con CSS o con JS, usar siempre CSS. El JS solo actúa donde el CSS no puede llegar (fetch, sockets, lógica de negocio).

### Mínimo HTML en JS

El JS debe actualizar valores de atributos o `textContent` de elementos HTML ya presentes en la página. No generar HTML nuevo con JS salvo en casos estrictamente necesarios (listas dinámicas de notificaciones en tiempo real).

### Multiidioma (i18n)

- Implementar en `main.js` un objeto de traducciones:

```javascript
const i18n = {
  es: { products: "Productos", stores: "Tiendas", employees: "Empleados", ... },
  en: { products: "Products", stores: "Stores", employees: "Employees", ... }
};
```

- Añadir atributo `data-i18n="clave"` a todos los elementos de texto de la UI.
- Al cambiar idioma, recorrer el DOM y actualizar `textContent` de cada elemento con `data-i18n`.
- Persistir la preferencia en `localStorage`.
- Incluir selector de idioma en la navbar (botón ES | EN).

### Dark / Light mode

- Implementar con una clase CSS en `<html>` (ej: `class="dark"`).
- Usar variables CSS en `style.css`:

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --surface: #f5f5f5;
  --border: #e0e0e0;
  --accent: #0066cc;
}
html.dark {
  --bg: #121212;
  --text: #e0e0e0;
  --surface: #1e1e1e;
  --border: #333333;
  --accent: #4da6ff;
}
```

- Toggle en la navbar. Persistir en `localStorage`.

### Librería de iconos

Usar **Font Awesome 6 Free** (CDN). Ejemplos:

| Atributo | Icono Font Awesome |
|---|---|
| `temperature` | `fa-thermometer-half` |
| `relativeHumidity` | `fa-tint` |
| `MachineryDriving` | `fa-cog` |
| `WritingReports` | `fa-file-alt` |
| `CustomerRelationships` | `fa-handshake` |
| Tweets (X/Twitter) | `fa-times` o SVG personalizado de X |
| Borrar | `fa-trash` |
| Editar | `fa-edit` |
| Añadir | `fa-plus` |
| Comprar | `fa-shopping-cart` |
| Mapa | `fa-map-marker-alt` |

### Navbar

- Secciones: **Home | Products | Stores | Employees | Stores Map**
- Sticky (fija al hacer scroll): `position: sticky; top: 0;`
- Resalta la sección activa: añadir clase `active` al enlace correspondiente mediante JS al cargar cada página.
- Incluye: selector de idioma (ES | EN), toggle Dark/Light, badge contador de notificaciones no leídas.

### Referencia visual obligatoria

Para implementar todos los aspectos visuales requeridos (barras de progreso con colores, tooltips, tarjetas hover, transiciones, modales, tablas con grupos, etc.), consultar y seguir la **sección HowTo de [W3Schools](https://www.w3schools.com/howto/)** como guía de referencia de implementación CSS/HTML puro. Priorizar siempre las soluciones CSS sobre las JS cuando W3Schools ofrezca ambas opciones.

---

## PARTE 10 — FORMULARIOS DE ENTRADA DE DATOS

Aplica a todos los formularios (añadir/editar Product, Store, Employee, Shelf, InventoryItem):

**Tipos de `<input>` obligatorios por entidad:**

| Campo | Tipo HTML |
|---|---|
| `Employee.email` | `<input type="email">` |
| `Employee.dateOfContract` | `<input type="date">` |
| `Employee.skills` | `<input type="checkbox">` (uno por habilidad) |
| `Employee.password` | `<input type="password">` + campo de confirmación |
| `Employee.category` | `<select>` con opciones |
| `Product.color` | `<input type="color">` (devuelve hex directamente) |
| `Product.price` | `<input type="number" min="0" step="0.01">` |
| `Product.size` | `<input type="radio">` (S / M / L / XL) |
| `Store.capacity` | `<input type="number" min="0">` |
| `Store.countryCode` | `<input type="text" maxlength="2" pattern="[A-Za-z]{2}">` |
| `Store.telephone` | `<input type="tel">` |
| `Store.url` | `<input type="url">` |
| `Store.description` | `<textarea>` |
| `Store.location` (lat/lng) | `<input type="number" step="0.000001">` (dos campos) |
| Imágenes | `<input type="url">` + preview |

**Validación:**

- Atributos HTML5: `required`, `min`, `max`, `minlength`, `maxlength`, `pattern`.
- Validación JS adicional antes del envío: verificar coherencia entre campos (ej: password === confirmación), mostrar mensaje de error junto al campo en el idioma seleccionado.

---

## PARTE 11 — VISTAS DETALLADAS

### Vista `Home`

- Diagrama UML Mermaid renderizado (`erDiagram` con todas las entidades y relaciones).
- Panel de estadísticas: número total de Stores, Products, Employees.
- Panel de notificaciones en tiempo real (se actualiza vía Socket.IO).

---

### Vista `Products` (lista)

Tabla con una fila por Product. Columnas:

| Columna | Contenido |
|---|---|
| Imagen | `<img>` con la imagen del producto |
| Nombre | Texto |
| Color | Cuadrado HTML con `background-color: <hex>` + código hex |
| Size | Texto |
| Acciones | Botón Editar (`fa-edit`) + Botón Borrar (`fa-trash`) |

- Botón **"Añadir nuevo producto"** (`fa-plus`) al principio de la vista.
- Cuando se reciba evento Socket.IO `price_change`, actualizar el precio en esta tabla **sin recargar la página** buscando el elemento por `data-product-id`.

---

### Vista `Product` (detalle)

- Nombre, imagen y todos los atributos del producto.
- **Tabla de InventoryItems agrupada por Store:**
  - Encabezado de grupo Store: nombre del Store + `stockCount` total para ese producto.
  - Filas bajo cada Store: una por Shelf que contiene ese producto, mostrando nombre de Shelf y `shelfCount`.
  - Botón **"Añadir a otra Shelf"** en el encabezado de cada Store: abre formulario con `<select>` que carga dinámicamente (fetch a `/api/stores/<store_id>/available-shelves/<product_id>`) las Shelves de ese Store que **aún no contienen** este producto.

---

### Vista `Stores` (lista)

Tabla con una fila por Store. Columnas:

| Columna | Contenido |
|---|---|
| Imagen | `<img>` con la imagen del Store |
| Nombre | Texto |
| País | Emoji de bandera o icono + código ISO (ej: 🇪🇸 ES) |
| Temperatura | Icono `fa-thermometer-half` + valor numérico + color según rango |
| Humedad | Icono `fa-tint` + valor numérico + color según rango |
| Acciones | Botón Editar + Botón Borrar |

**Colores de temperatura:**

- Frío (< 10 °C) → azul (`#0099cc`)
- Normal (10–25 °C) → verde (`#28a745`)
- Caliente (> 25 °C) → rojo (`#dc3545`)

**Colores de humedad:**

- Baja (< 30%) → amarillo (`#ffc107`)
- Normal (30–70%) → verde (`#28a745`)
- Alta (> 70%) → azul (`#0099cc`)

- Botón **"Añadir nueva tienda"** al principio.

---

### Vista `Store` (detalle)

Implementa todas las secciones siguientes, en este orden:

#### a) Foto del almacén con animación CSS

```css
.store-photo {
  transition: transform 0.6s ease;
  cursor: pointer;
}
.store-photo:hover {
  transform: scale(1.15) rotate(360deg);
}
```

#### b) Información de temperatura y humedad

Muestra para cada sensor:

```html
<span class="sensor-icon fa fa-thermometer-half" style="color: <color_según_valor>"></span>
<span class="sensor-value" data-store-id="...">23.4 °C</span>
```

Usar los mismos umbrales de color definidos en la vista Stores (lista).

#### c) Mapa Leaflet.js (ubicación individual)

- Mapa centrado en las coordenadas GPS del Store.
- Marcador con popup que muestra nombre y dirección.
- Altura del mapa: 300px.

#### d) Recorrido virtual 3D con Three.js

Implementar en `store_3d.js` una escena Three.js dentro de un `<canvas>` con:

- Suelo (plano) representando el almacén.
- Cada Shelf como una caja 3D (`BoxGeometry`) distribuida por el espacio.
- Encima de cada Shelf: texto con los nombres y cantidades de los Products que contiene (`shelfCount` y `stockCount`).
- Controles de cámara: `OrbitControls` (o implementación equivalente con `mousemove`).
- Iluminación básica: `AmbientLight` + `DirectionalLight`.

#### e) Tabla de InventoryItems agrupada por Shelf

Por cada Shelf:

- **Fila de encabezado de Shelf:**
  - Nombre de la Shelf.
  - Barra de progreso del nivel de llenado (`numberOfItems / maxCapacity`):
    - Verde si < 50%.
    - Naranja si entre 50% y 80%.
    - Rojo si ≥ 80%.
  - Botón **"Editar Shelf"** (`fa-edit`).
  - Botón **"Añadir Product a esta Shelf"** (`fa-plus`): abre formulario con `<select>` que carga dinámicamente los Products existentes **que aún no están** en esa Shelf (fetch a `/api/shelves/<shelf_id>/available-products`).

- **Filas de productos de esa Shelf:**

| Columna | Contenido |
|---|---|
| Imagen | `<img>` miniatura del producto |
| Nombre | Texto |
| Precio | Valor numérico con `data-product-id` (actualizable por Socket.IO) |
| Size | Texto |
| Color | Cuadrado coloreado con `background-color: <hex>` |
| Stock total | `stockCount` |
| En Shelf | `shelfCount` |
| Comprar | Botón `fa-shopping-cart` |

- **Botón "Comprar":** ejecuta sin recargar:

```
PATCH /v2/entities/<inventoryitem_id>/attrs
Content-Type: application/json

{
  "shelfCount": {"type": "Integer", "value": {"$inc": -1}},
  "stockCount":  {"type": "Integer", "value": {"$inc": -1}}
}
```

Actualiza inmediatamente en la UI los valores de `shelfCount` y `stockCount` del elemento correspondiente.

- **Botón "Añadir nueva Shelf a este Store"** al final de la sección.

#### f) Tweets del Store

- Obtener el atributo `tweets` del Store desde Orion.
- Mostrar cada tweet en su propia fila:

```html
<div class="tweet-row">
  <i class="tweet-icon">𝕏</i>  <!-- SVG o carácter que recuerde a X/Twitter -->
  <span>Texto del tweet</span>
</div>
```

#### g) Panel de notificaciones en tiempo real

- Sección visible en la vista.
- Al recibir evento Socket.IO `low_stock` con el `store_id` correspondiente, añadir una fila al panel:

```html
<div class="notification-item warning">
  <i class="fa fa-exclamation-triangle"></i>
  Stock bajo: <strong>Nombre Producto</strong> — quedan <strong>N</strong> unidades en Shelf X
</div>
```

---

### Vista `Employees` (lista)

Tabla con una fila por Employee. Columnas:

| Columna | Contenido |
|---|---|
| Foto | `<img class="employee-photo">` con efecto hover zoom CSS |
| Nombre | Texto |
| Categoría | Icono según categoría + texto |
| Skills | Icono por cada habilidad activa |
| Acciones | Botón Editar + Botón Borrar |

**Efecto hover zoom foto (CSS puro):**

```css
.employee-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.3s ease;
}
.employee-photo:hover {
  transform: scale(1.4);
}
```

**Iconos de skills:**

- `MachineryDriving` → `fa-cog`
- `WritingReports` → `fa-file-alt`
- `CustomerRelationships` → `fa-handshake`

- Botón **"Añadir nuevo empleado"** al principio.

---

### Vista `Employee` (detalle)

- Todos los atributos del Employee.
- Foto con efecto hover (mismo CSS de la lista).
- Nombre del Store donde trabaja, con enlace a la vista de detalle de ese Store.

---

### Vista `Stores Map`

- Pestaña **"Stores Map"** en la navbar.
- Mapa **Leaflet.js** que muestra simultáneamente todos los Stores.
- Cada Store: marcador personalizado con la imagen del Store como icono (`L.divIcon` con `<img>`).
- **Al pasar el ratón sobre un marcador:** mostrar popup/tooltip con:
  - Imagen del Store.
  - Nombre.
  - `countryCode`.
  - Temperatura (con color).
  - Humedad (con color).
- **Al hacer clic sobre un marcador:** navegar a `/stores/<store_id>`.

---

## PARTE 12 — SINCRONIZACIÓN EN TIEMPO REAL (Socket.IO)

### Evento `price_change`

El cliente escucha el evento en **todas las páginas** (incluir listener en `base.html`):

```javascript
socket.on('price_change', (data) => {
  // Actualizar todos los elementos con data-product-id === data.product_id
  document.querySelectorAll(`[data-product-id="${data.product_id}"] .product-price`)
    .forEach(el => el.textContent = data.new_price + ' €');
});
```

### Evento `low_stock`

```javascript
socket.on('low_stock', (data) => {
  // Si estamos en la vista de ese Store, añadir notificación al panel
  const panel = document.getElementById('notifications-panel');
  if (panel && panel.dataset.storeId === data.store_id) {
    // Añadir fila de notificación
  }
  // Incrementar badge de notificaciones en navbar
  const badge = document.getElementById('notif-badge');
  badge.textContent = parseInt(badge.textContent || 0) + 1;
  badge.style.display = 'inline';
});
```

---

## PARTE 13 — ENTREGA FINAL

1. **`requirements.txt`:** ejecutar `pip freeze > requirements.txt` en el entorno virtual y añadirlo al repositorio.

2. **`README.md`:** incluir:
   - URL del repositorio GitHub.
   - Prerrequisitos: Docker Desktop, Python 3.10+, pip.
   - Pasos de instalación y ejecución:
     1. `git clone <url>`
     2. `cd <carpeta>`
     3. `python -m venv .venv && source .venv/bin/activate`
     4. `pip install -r requirements.txt`
     5. `docker compose up -d`
     6. `bash import-data.sh`
     7. `python app.py`
   - Descripción de variables de entorno del `.env`.
   - Funcionalidades implementadas.

3. **Archivo ZIP** mediante `git archive --format=zip HEAD -o practica2.zip`. Añadir fuera del `git archive` (si es necesario):
   - Conversaciones con el agente (solo al final, para que no influyan como contexto durante el desarrollo).
   - `README.md`.
   - `requirements.txt`.

---

## PARTE 14 — STACK TECNOLÓGICO Y VERSIONES

| Tecnología | Uso | Notas |
|---|---|---|
| Python 3.10+ | Lenguaje backend | Usar entorno virtual `.venv` |
| Flask 3.x | Servidor web | Blueprints para rutas |
| Flask-SocketIO 5.x | Notificaciones server→client | `async_mode='eventlet'` |
| eventlet | Servidor WSGI async | Compatible con SocketIO |
| python-dotenv | Variables de entorno | |
| requests | Llamadas HTTP a Orion | |
| bcrypt | Hash de contraseñas | |
| Socket.IO 4.x (cliente) | Eventos en browser | CDN |
| Orion Context Broker | NGSIv2 REST API | Puerto 1026, Docker |
| Three.js r128+ | Recorrido virtual 3D | CDN `cdnjs.cloudflare.com` |
| Leaflet.js 1.9+ | Mapas interactivos | CDN |
| Mermaid.js 10+ | Diagrama UML entidades | CDN `esm.sh` |
| Font Awesome 6 Free | Iconografía UI | CDN |
| Docker Compose | Orion + MongoDB + tutorial | Archivos base existentes |
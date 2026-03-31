# AGENTS.md — Instrucciones para el Agente

Documento de referencia para implementación de la aplicación FIWARE.

## 1. Recordatorio de Actualización de Documentación

Tras completar cada issue:
1. Actualizar `PRD.md` con nuevas funcionalidades
2. Actualizar `architecture.md` con cambios de estructura/flujos
3. Actualizar `data_model.md` si hay nuevas entidades/atributos

Frecuencia: Después de cada merge de rama `feature/*` o `fix/*` a `main`.

---

## 2. Convenciones de Nombres

### Identificadores Orion (URN)
Formato: `urn:ngsi-ld:<EntityType>:<UniqueIdentifier>`

Ejemplos:
- `urn:ngsi-ld:Store:madrid-centro`
- `urn:ngsi-ld:Product:laptop-gaming-asus`

Reglas:
- kebab-case para identificadores
- Descriptivos y únicos
- Consistencia global

### Rutas Flask
Patrón: `/<Entity>/<action>` o `/<Entity>/<id>/<action>`

Ejemplos:
- `GET /products` → lista
- `GET /products/prod1` → detalle
- `POST /products` → crear
- `PATCH /v2/entities/urn:ngsi-ld:Product:prod1/attrs` → actualizar

### Variables JavaScript
- camelCase para variables/funciones
- UPPER_CASE para constantes

### Variables CSS
- kebab-case con prefijo

### Templates Jinja2
Patrón: `<Entity>-<action>.html` o `<Entity>.html`

---

## 3. Estilo de Código

### Python
- Indentación: 4 espacios
- Línea máxima: 100 caracteres
- Importaciones organizadas
- Docstring Google para funciones críticas
- try/except explícito, loguear errores
- Validar inputs, devolver códigos HTTP apropiados

### HTML (Jinja2)
- Indentación: 2 espacios
- Etiquetas semánticas (<nav>, <main>, <section>)
- Atributos `data-*` para JS, `id` para únicos
- `data-i18n` en todos los textos visibles
- HTML5 inputs con validación

### CSS
- Indentación: 2 espacios
- Variables CSS con `--variable-name`
- Mobile-first, media queries desktop
- Clase `dark-theme` en `<body>` para tema oscuro

### JavaScript
- Indentación: 2 espacios
- Comillas simples ' consistentes
- Preferir `const`, usar `let` si reasignación
- Arrow functions para callbacks
- Usar `defer` en `<script>` tags

---

## 4. Stack Tecnológico (Versiones de Referencia)

### Backend
Python 3.10+, Flask 3.x, Flask-SocketIO 5.x, eventlet, python-dotenv, requests, bcrypt

### Frontend
Socket.IO 4.x, Three.js r128+, Leaflet.js 1.9+, Mermaid.js 10+, Font Awesome 6

### Infraestructura
Docker 2.x+, Orion 3.x, MongoDB 4.4+, FIWARE tutorial:latest

---

## 5. GitHub Flow Obligatorio

### 5.1 Planificación (Modo Plan)
- Plan detallado del issue
- Archivos a crear/modificar
- Funciones principales
- Validaciones

### 5.2 Crear Issue GitHub
- Título descriptivo
- Descripción: contenido del plan
- Labels: feature, backend, frontend
- Copiar número issue

### 5.3 Crear Rama Local
\`\`\`bash
git checkout -b feature/issue-<número>-<descripción>
\`\`\`

Formato: `feature/`, `fix/`, `refactor/` + número + descripción (kebab-case)

### 5.4 Implementar
- Seguir convenciones
- Revisar contra especificación
- Probar manualmente
- Commits frecuentes descriptivos

\`\`\`bash
git commit -m "feat(#5): Implementar modelo datos Product

- Definir Product en Orion
- Rutas GET /products, /products/<id>
- Validación atributos NGSIv2"
\`\`\`

### 5.5 Commit + Push
\`\`\`bash
git push origin feature/issue-5-modelo-datos
\`\`\`

### 5.6 Merge a Main
\`\`\`bash
git checkout main
git pull origin main
git merge --no-ff feature/issue-5-modelo-datos
git push origin main
\`\`\`

### 5.7 Cerrar Issue
- Comentar en issue
- Cambiar estado a "Closed"

### 5.8 Sincronizar Local
\`\`\`bash
git checkout main
git pull origin main
git branch -d feature/issue-5-modelo-datos
\`\`\`

### 5.9 Actualizar Documentación
\`\`\`bash
git add PRD.md architecture.md data_model.md
git commit -m "docs(#5): Actualizar documentación"
git push origin main
\`\`\`

---

## 6. Puntos Críticos de Implementación

### 6.1 NO Usar Localhost en Webhooks [CRÍTICO]
SIEMPRE usar `host.docker.internal`, NUNCA `localhost`:

✅ CORRECTO:
\`\`\`json
{"http": {"url": "http://host.docker.internal:5000/notify/price-change"}}
\`\`\`

❌ INCORRECTO:
\`\`\`json
{"http": {"url": "http://localhost:5000/notify/price-change"}}
\`\`\`

Porqué: Orion en contenedor; localhost apunta al contenedor, no al host.

### 6.2 Coherencia de InventoryItems [CRÍTICA]
stockCount = suma shelfCount del producto en todas Shelves del Store

Validar:
1. Después de crear/editar InventoryItem, recalcular stockCount
2. Verificar shelfCount ≤ stockCount SIEMPRE
3. En import-data.sh, asegurar coherencia

### 6.3 Formato NGSIv2 Riguroso [CRÍTICO]
TODO atributo DEBE incluir `type` y `value`:

✅ CORRECTO:
\`\`\`json
{
  "name": {"type": "Text", "value": "Laptop"},
  "price": {"type": "Number", "value": 999.99},
  "location": {"type": "geo:json", "value": {"type": "Point", "coordinates": [-3.7038, 40.4168]}}
}
\`\`\`

### 6.4 Validación de CountryCode
EXACTAMENTE 2 caracteres alfabéticos:

\`\`\`html
<input type="text" maxlength="2" pattern="[A-Za-z]{2}" required />
\`\`\`

### 6.5 Cada Shelf Mínimo 4 Products [REQUISITO]
En import-data.sh, garantizar que cada Shelf tiene ≥ 4 InventoryItems con productos distintos.

### 6.6 Barra de Progreso Shelf [REQUISITO UI]
Color según percentil: Verde (<50%), Naranja (50-80%), Rojo (≥80%)

### 6.7 Socket.IO Escucharse en base.html [CRÍTICO]
Listeners globales DEBEN estar en `base.html` (template padre):

\`\`\`html
<script src="https://cdn.socket.io/4.x/socket.io.min.js"></script>
<script>
  const socket = io();
  socket.on('price_change', (data) => { /* actualizar */ });
  socket.on('low_stock', (data) => { /* notificar */ });
</script>
\`\`\`

---

## 7. Checklist Previo a Merge

- [ ] Código compila/ejecuta sin errores
- [ ] Sigue convenciones de nombres y estilo
- [ ] NGSIv2 format correcto (type + value)
- [ ] Webhooks usan host.docker.internal
- [ ] InventoryItems coherentes
- [ ] Cada Shelf tiene ≥ 4 productos
- [ ] Formularios validan HTML5
- [ ] UI respeta Dark/Light e i18n
- [ ] Prueba manual en navegador
- [ ] Documentación actualizada
- [ ] Commit messages descriptivos
- [ ] Issue enlazado en commits

---

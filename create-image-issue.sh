#!/bin/bash

# ============================================================================
# Script para crear un issue en GitHub automáticamente
# ============================================================================
# Uso: ./create-image-issue.sh
# Requiere: Autenticación GitHub CLI (gh auth login)
# ============================================================================

set -e

REPO="alvaroprzr/FIWARE-app"
TITLE="Pulir Detalles Estéticos: Actualizar Imágenes de Productos, Tiendas y Empleados"
BODY=$(cat <<'EOF'
## Descripción

Actualizar las imágenes (URLs de Unsplash) de productos, tiendas y empleados que no aparecen correctamente o que no concuerdan con su descripción.

### Imágenes que no aparecen (6 elementos):
- Teclado Mecanico RGB
- Laptop Gaming ASUS ROG
- Almacen Madrid Centro
- Almacen Barcelona Puerto
- Entrepot Paris Nord
- Alessandra Rossi Bianchi

### Imágenes incorrectamente seleccionadas (5 elementos):
- Monitor LG 4K 27 pulgadas
- Camara Web Logitech 4K PRO
- Docking Station USB-C 7-en-1
- SSD Samsung 990 PRO 2TB
- Memoria RAM Corsair VENGEANCE DDR5

## Cambios Propuestos

### Productos (5 cambios en import-data.sh):
- PROD1 (Laptop Gaming ASUS ROG) - línea 262
- PROD2 (Monitor LG 4K) - línea 273
- PROD6 (Webcam Logitech) - línea 317
- PROD8 (SSD Samsung) - línea 341
- PROD9 (RAM Corsair) - línea 353

### Tiendas (3 cambios en import-data.sh):
- STORE1 (Madrid Centro) - línea 127
- STORE2 (Barcelona Puerto) - línea 142
- STORE3 (Paris Nord) - línea 157

### Empleados (1 cambio en import-data.sh):
- EMP4 (Alessandra Rossi Bianchi) - línea 237

## Pasos de Implementación

1. Actualizar URLs de Unsplash en `import-data.sh`
2. Re-ejecutar `./import-data.sh` para actualizar entidades en Orion
3. Verificar que todas las imágenes cargan sin errores 404
4. Probar en navegador (tema claro/oscuro)

## Criterios de Aceptación

- [ ] Todas las imágenes cargan correctamente
- [ ] Cada imagen corresponde al elemento que representa
- [ ] No hay imágenes duplicadas
- [ ] Compatible con diseño responsive
- [ ] Funciona en tema claro y oscuro

Ver detalles completos en: [ISSUE_POLISH_IMAGES.md](ISSUE_POLISH_IMAGES.md)
EOF
)

LABELS="feature,frontend,polish,ui-ux"

echo "📋 Creando issue en GitHub..."
echo "Repository: $REPO"
echo "Title: $TITLE"
echo ""

# Verificar si gh está disponible
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) no está instalado"
    echo "   Instálalo con: sudo apt-get install gh"
    echo "   O descárga desde: https://github.com/cli/cli"
    exit 1
fi

# Crear el issue
if gh issue create \
    --repo "$REPO" \
    --title "$TITLE" \
    --body "$BODY" \
    --label "$LABELS"; then
    echo ""
    echo "✅ Issue creado exitosamente"
    echo "📍 Abre tu repositorio: https://github.com/$REPO/issues"
else
    echo "❌ Error al crear el issue"
    echo "   ¿Estás autenticado? Usa: gh auth login"
    exit 1
fi

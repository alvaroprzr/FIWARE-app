#!/bin/bash

# Script: import-data.sh
# Carga datos iniciales en Orion Context Broker
# - 4 Stores en ciudades europeas distintas
# - 16 Shelves (4 por store)
# - 4 Employees (1 por store)
# - 10 Products
# - InventoryItems coherentes (cada Shelf ≥ 4 productos)

set -e

# Funciones auxiliares (DEBEN ir primero)
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

post_entity() {
  local entity=$1
  local url="${ORION_URL}/v2/entities"
  
  # Compact JSON by removing newlines and extra spaces (preserving content in strings)
  # Method: Replace newlines with spaces, then collapse multiple spaces to single space
  local compact_entity=$(printf '%s' "$entity" | tr -d '\n' | sed 's/  */ /g' | sed 's/" , /", /g' | sed 's/" : /": /g')
  
  local entity_type=$(echo "$compact_entity" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
  local entity_id=$(echo "$compact_entity" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  
  log "POST entity: type=$entity_type id=$entity_id"
  
  if [ "$DEBUG" = "1" ]; then
    COUNTER=$((COUNTER + 1))
    JSON_FILE="$DEBUG_DIR/request_${COUNTER}_${entity_type}.json"
    # Save original for inspection  
    echo "$entity" > "$JSON_FILE"
    COMPACT_JSON_FILE="$DEBUG_DIR/request_${COUNTER}_${entity_type}_compact.json"
    echo "$compact_entity" > "$COMPACT_JSON_FILE"
    log "  [DEBUG] JSON saved (original: $JSON_FILE, compact: $COMPACT_JSON_FILE)"
    
    # Execute curl with compacted JSON - use printf to safely pass
    RESPONSE_FILE="$DEBUG_DIR/response_${COUNTER}_${entity_type}.txt"
    ACTUAL_CODE=$(printf '%s' "$compact_entity" | curl -s -o "$RESPONSE_FILE" -w "%{http_code}" -X POST "${url}" \
      -H "Content-Type: application/json" \
      -d @-)
    
    log "  [DEBUG] HTTP $ACTUAL_CODE - Response saved to $RESPONSE_FILE"
    
    if [ "$ACTUAL_CODE" != "201" ]; then
      log "  [ERROR] HTTP $ACTUAL_CODE - Response body:"
      cat "$RESPONSE_FILE" | head -20
      log "  [ERROR] Compacted JSON was:"
      head -c 200 "$COMPACT_JSON_FILE" | sed 's/^/    /'
    fi
    
    echo "$ACTUAL_CODE"
  else
    # Non-debug mode: send compacted JSON  
    printf '%s' "$compact_entity" | curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "${url}" \
      -H "Content-Type: application/json" \
      -d @-
  fi
}

# Configuracion
ORION_URL="${ORION_URL:-http://localhost:1026}"
DEBUG="${DEBUG:-0}"
COUNTER=0

# Debug directory
if [ "$DEBUG" = "1" ]; then
  DEBUG_DIR="/tmp/orion_debug_$$"
  mkdir -p "$DEBUG_DIR"
  log "DEBUG MODE ENABLED: Saving JSON dumps to $DEBUG_DIR"
fi

delete_entities_by_type() {
  local entity_type="$1"
  local deleted=0
  local ids

      ids=$(curl -s "${ORION_URL}/v2/entities?type=${entity_type}&limit=1000&options=keyValues" | python3 -c "import json,sys; data=json.load(sys.stdin); data=data if isinstance(data,list) else []; [print(e.get('id')) for e in data if isinstance(e,dict) and e.get('id')]")

  if [ -z "$ids" ]; then
    log "No existing entities to delete for type=${entity_type}"
    return 0
  fi

  while IFS= read -r entity_id; do
    [ -z "$entity_id" ] && continue
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${ORION_URL}/v2/entities/${entity_id}")
    if [ "$code" != "204" ] && [ "$code" != "404" ]; then
      log "[ERROR] Failed deleting ${entity_id} (HTTP ${code})"
      exit 1
    fi
    deleted=$((deleted + 1))
  done <<< "$ids"

  log "Deleted ${deleted} entities for type=${entity_type}"
}

log "=== LIMPIANDO DATOS EXISTENTES ==="
# Orden para mantener coherencia referencial durante limpieza.
for entity_type in InventoryItem Shelf Employee Product Store; do
  delete_entities_by_type "$entity_type"
done

# ============================================================================
# 4 STORES (ciudades europeas con coordenadas reales)
# ============================================================================

log "=== CREANDO STORES ==="

# Store 1: Madrid, Espana (40.4168° N, 3.7038° W)
STORE1='{
  "id": "urn:ngsi-ld:Store:madrid-centro",
  "type": "Store",
  "name": {"type": "Text", "value": "Almacen Madrid Centro"},
  "url": {"type": "Text", "value": "https://store-madrid.example.com"},
  "telephone": {"type": "Text", "value": "+34 912 345 678"},
  "countryCode": {"type": "Text", "value": "ES"},
  "capacity": {"type": "Number", "value": 5000.0},
  "description": {"type": "Text", "value": "Almacen principal en el centro de Madrid, equipado con sistemas de climatizacion modernos. Punto de distribucion hacia la zona central de Espana."},
  "address": {"type": "StructuredValue", "value": {"streetAddress": "Calle Mayor 123", "postalCode": "28001", "addressLocality": "Madrid", "addressCountry": "ES"}},
  "location": {"type": "geo:json", "value": {"type": "Point", "coordinates": [-3.7038, 40.4168]}},
  "image": {"type": "Text", "value": "/static/images/madrid.svg"}
}'
post_entity "$STORE1"

# Store 2: Barcelona, Espana (41.3851° N, 2.1734° E)
STORE2='{
  "id": "urn:ngsi-ld:Store:barcelona-port",
  "type": "Store",
  "name": {"type": "Text", "value": "Almacen Barcelona Puerto"},
  "url": {"type": "Text", "value": "https://store-barcelona.example.com"},
  "telephone": {"type": "Text", "value": "+34 933 456 789"},
  "countryCode": {"type": "Text", "value": "ES"},
  "capacity": {"type": "Number", "value": 4500.0},
  "description": {"type": "Text", "value": "Almacen logistico en zona portuaria de Barcelona. Especializado en distribucion mediterranea con acceso directo a vias de transporte."},
  "address": {"type": "StructuredValue", "value": {"streetAddress": "Avenida Diagonal 456", "postalCode": "08009", "addressLocality": "Barcelona", "addressCountry": "ES"}},
  "location": {"type": "geo:json", "value": {"type": "Point", "coordinates": [2.1734, 41.3851]}},
  "image": {"type": "Text", "value": "/static/images/barcelona.svg"}
}'
post_entity "$STORE2"

# Store 3: Paris, Francia (48.8566° N, 2.3522° E)
STORE3='{
  "id": "urn:ngsi-ld:Store:paris-nord",
  "type": "Store",
  "name": {"type": "Text", "value": "Entrepot Paris Nord"},
  "url": {"type": "Text", "value": "https://store-paris.example.com"},
  "telephone": {"type": "Text", "value": "+33 1 42 34 56 78"},
  "countryCode": {"type": "Text", "value": "FR"},
  "capacity": {"type": "Number", "value": 6000.0},
  "description": {"type": "Text", "value": "Centro logistico en las afueras de Paris, principal distribuidor para Francia y Benelux. Infraestructura de ultima generacion."},
  "address": {"type": "StructuredValue", "value": {"streetAddress": "Route de Paris 789", "postalCode": "75018", "addressLocality": "Paris", "addressCountry": "FR"}},
  "location": {"type": "geo:json", "value": {"type": "Point", "coordinates": [2.3522, 48.8566]}},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"}
}'
post_entity "$STORE3"

# Store 4: Milan, Italia (45.4642° N, 9.1900° E)
STORE4='{
  "id": "urn:ngsi-ld:Store:milano-sud",
  "type": "Store",
  "name": {"type": "Text", "value": "Magazzino Milano Sud"},
  "url": {"type": "Text", "value": "https://store-milano.example.com"},
  "telephone": {"type": "Text", "value": "+39 02 1234 5678"},
  "countryCode": {"type": "Text", "value": "IT"},
  "capacity": {"type": "Number", "value": 5500.0},
  "description": {"type": "Text", "value": "Almacen de distribucion en el sur de Milan, estrategicamente ubicado para servir Italia, Suiza y los Alpes. Especializado en logistica farmaceutica y tecnologica."},
  "address": {"type": "StructuredValue", "value": {"streetAddress": "Via Industria 234", "postalCode": "20090", "addressLocality": "Milano", "addressCountry": "IT"}},
  "location": {"type": "geo:json", "value": {"type": "Point", "coordinates": [9.1900, 45.4642]}},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"}
}'
post_entity "$STORE4"

# ============================================================================
# 4 EMPLOYEES (1 por store)
# ============================================================================

log "=== CREANDO EMPLOYEES ==="

# Employee 1: Madrid
EMP1='{
  "id": "urn:ngsi-ld:Employee:emp001",
  "type": "Employee",
  "name": {"type": "Text", "value": "Juan Garcia Lopez"},
  "email": {"type": "Text", "value": "juan.garcia@empresa.com"},
  "dateOfContract": {"type": "DateTime", "value": "2020-03-15T09:00:00Z"},
  "skills": {"type": "Array", "value": ["MachineryDriving", "CustomerRelationships"]},
  "username": {"type": "Text", "value": "jgarcia"},
  "password": {"type": "Text", "value": "$2b$12$abcdefghijklmnopqrstuvwxyz123456789"},
  "category": {"type": "Text", "value": "Supervisor"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"}
}'
post_entity "$EMP1"

# Employee 2: Barcelona
EMP2='{
  "id": "urn:ngsi-ld:Employee:emp002",
  "type": "Employee",
  "name": {"type": "Text", "value": "Maria Rodriguez Fernandez"},
  "email": {"type": "Text", "value": "maria.rodriguez@empresa.com"},
  "dateOfContract": {"type": "DateTime", "value": "2019-06-20T10:30:00Z"},
  "skills": {"type": "Array", "value": ["WritingReports", "CustomerRelationships"]},
  "username": {"type": "Text", "value": "mrodriguez"},
  "password": {"type": "Text", "value": "$2b$12$abcdefghijklmnopqrstuvwxyz123456789"},
  "category": {"type": "Text", "value": "Manager"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:barcelona-port"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1494790108377-be9c29b29330"}
}'
post_entity "$EMP2"

# Employee 3: Paris
EMP3='{
  "id": "urn:ngsi-ld:Employee:emp003",
  "type": "Employee",
  "name": {"type": "Text", "value": "Pierre Dubois Martin"},
  "email": {"type": "Text", "value": "pierre.dubois@empresa.com"},
  "dateOfContract": {"type": "DateTime", "value": "2021-01-10T08:45:00Z"},
  "skills": {"type": "Array", "value": ["MachineryDriving", "WritingReports"]},
  "username": {"type": "Text", "value": "pdubois"},
  "password": {"type": "Text", "value": "$2b$12$abcdefghijklmnopqrstuvwxyz123456789"},
  "category": {"type": "Text", "value": "Staff"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:paris-nord"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}
}'
post_entity "$EMP3"

# Employee 4: Milan
EMP4='{
  "id": "urn:ngsi-ld:Employee:emp004",
  "type": "Employee",
  "name": {"type": "Text", "value": "Alessandra Rossi Bianchi"},
  "email": {"type": "Text", "value": "alessandra.rossi@empresa.com"},
  "dateOfContract": {"type": "DateTime", "value": "2022-02-28T14:20:00Z"},
  "skills": {"type": "Array", "value": ["CustomerRelationships"]},
  "username": {"type": "Text", "value": "arossi"},
  "password": {"type": "Text", "value": "$2b$12$abcdefghijklmnopqrstuvwxyz123456789"},
  "category": {"type": "Text", "value": "Staff"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:milano-sud"},
  "image": {"type": "Text", "value": "/static/images/alessandra.svg"}
}'
post_entity "$EMP4"

# ============================================================================
# 10 PRODUCTS
# ============================================================================

log "=== CREANDO PRODUCTS ==="

PROD1='{
  "id": "urn:ngsi-ld:Product:laptop-asus",
  "type": "Product",
  "name": {"type": "Text", "value": "Laptop Gaming ASUS ROG"},
  "price": {"type": "Number", "value": 1299.99},
  "size": {"type": "Text", "value": "15.6"},
  "color": {"type": "Text", "value": "#FF5733"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"}
}'
post_entity "$PROD1"

PROD2='{
  "id": "urn:ngsi-ld:Product:monitor-lg",
  "type": "Product",
  "name": {"type": "Text", "value": "Monitor LG 4K 27 pulgadas"},
  "price": {"type": "Number", "value": 499.99},
  "size": {"type": "Text", "value": "27"},
  "color": {"type": "Text", "value": "#000000"},
  "image": {"type": "Text", "value": "/static/images/monitor.svg"}
}'
post_entity "$PROD2"

PROD3='{
  "id": "urn:ngsi-ld:Product:mouse-logitech",
  "type": "Product",
  "name": {"type": "Text", "value": "Mouse Inalambrico Logitech"},
  "price": {"type": "Number", "value": 49.99},
  "size": {"type": "Text", "value": "M"},
  "color": {"type": "Text", "value": "#CCCCCC"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1527814050087-3793815479db"}
}'
post_entity "$PROD3"

PROD4='{
  "id": "urn:ngsi-ld:Product:keyboard-mechanical",
  "type": "Product",
  "name": {"type": "Text", "value": "Teclado Mecanico RGB"},
  "price": {"type": "Number", "value": 129.99},
  "size": {"type": "Text", "value": "L"},
  "color": {"type": "Text", "value": "#0099FF"},
  "image": {"type": "Text", "value": "/static/images/keyboard.svg"}
}'
post_entity "$PROD4"

PROD5='{
  "id": "urn:ngsi-ld:Product:headphones-sony",
  "type": "Product",
  "name": {"type": "Text", "value": "Auriculares Sony WH-1000XM5"},
  "price": {"type": "Number", "value": 379.99},
  "size": {"type": "Text", "value": "S"},
  "color": {"type": "Text", "value": "#1a1a1a"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
}'
post_entity "$PROD5"

PROD6='{
  "id": "urn:ngsi-ld:Product:webcam-logitech",
  "type": "Product",
  "name": {"type": "Text", "value": "Camara Web Logitech 4K PRO"},
  "price": {"type": "Number", "value": 199.99},
  "size": {"type": "Text", "value": "M"},
  "color": {"type": "Text", "value": "#333333"},
  "image": {"type": "Text", "value": "/static/images/camera.svg"}
}'
post_entity "$PROD6"

PROD7='{
  "id": "urn:ngsi-ld:Product:usb-dock",
  "type": "Product",
  "name": {"type": "Text", "value": "Docking Station USB-C 7-en-1"},
  "price": {"type": "Number", "value": 79.99},
  "size": {"type": "Text", "value": "S"},
  "color": {"type": "Text", "value": "#AAAAAA"},
  "image": {"type": "Text", "value": "/static/images/docking.svg"}
}'
post_entity "$PROD7"

PROD8='{
  "id": "urn:ngsi-ld:Product:ssd-samsung",
  "type": "Product",
  "name": {"type": "Text", "value": "SSD Samsung 990 PRO 2TB"},
  "price": {"type": "Number", "value": 249.99},
  "size": {"type": "Text", "value": "L"},
  "color": {"type": "Text", "value": "#FF0000"},
  "image": {"type": "Text", "value": "/static/images/ssd.svg"}
}'
post_entity "$PROD8"

PROD9='{
  "id": "urn:ngsi-ld:Product:ram-corsair",
  "type": "Product",
  "name": {"type": "Text", "value": "Memoria RAM Corsair VENGEANCE DDR5 32GB"},
  "price": {"type": "Number", "value": 179.99},
  "size": {"type": "Text", "value": "M"},
  "color": {"type": "Text", "value": "#00DD00"},
  "image": {"type": "Text", "value": "/static/images/ram.svg"}
}'
post_entity "$PROD9"

PROD10='{
  "id": "urn:ngsi-ld:Product:power-supply",
  "type": "Product",
  "name": {"type": "Text", "value": "Fuente de Alimentacion Modular 850W"},
  "price": {"type": "Number", "value": 129.99},
  "size": {"type": "Text", "value": "L"},
  "color": {"type": "Text", "value": "#FFAA00"},
  "image": {"type": "Text", "value": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b"}
}'
post_entity "$PROD10"

# ============================================================================
# 16 SHELVES (4 por Store) - Cada Shelf tendra un nombre y capacidad distinto
# ============================================================================

log "=== CREANDO SHELVES ==="

# Shelves Madrid Centro (4)
for i in 1 2 3 4; do
  SHELF=$(cat <<EOF
{
  "id": "urn:ngsi-ld:Shelf:madrid-shelf-a${i}",
  "type": "Shelf",
  "name": {"type": "Text", "value": "Estanteria Sector A${i}"},
  "maxCapacity": {"type": "Number", "value": $((15 + i * 2))},
  "numberOfItems": {"type": "Number", "value": 0},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"}
}
EOF
  )
  post_entity "$SHELF"
done

# Shelves Barcelona Port (4)
for i in 1 2 3 4; do
  SHELF=$(cat <<EOF
{
  "id": "urn:ngsi-ld:Shelf:barcelona-shelf-b${i}",
  "type": "Shelf",
  "name": {"type": "Text", "value": "Estanteria Sector B${i}"},
  "maxCapacity": {"type": "Number", "value": $((16 + i * 2))},
  "numberOfItems": {"type": "Number", "value": 0},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:barcelona-port"}
}
EOF
  )
  post_entity "$SHELF"
done

# Shelves Paris Nord (4)
for i in 1 2 3 4; do
  SHELF=$(cat <<EOF
{
  "id": "urn:ngsi-ld:Shelf:paris-shelf-c${i}",
  "type": "Shelf",
  "name": {"type": "Text", "value": "Estantería Sector C${i}"},
  "maxCapacity": {"type": "Number", "value": $((14 + i * 2))},
  "numberOfItems": {"type": "Number", "value": 0},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:paris-nord"}
}
EOF
  )
  post_entity "$SHELF"
done

# Shelves Milan Sud (4)
for i in 1 2 3 4; do
  SHELF=$(cat <<EOF
{
  "id": "urn:ngsi-ld:Shelf:milano-shelf-d${i}",
  "type": "Shelf",
  "name": {"type": "Text", "value": "Estantería Sector D${i}"},
  "maxCapacity": {"type": "Number", "value": $((15 + i * 2))},
  "numberOfItems": {"type": "Number", "value": 0},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:milano-sud"}
}
EOF
  )
  post_entity "$SHELF"
done

# ============================================================================
# INVENTORY ITEMS - Asegurar 4+ productos por Shelf
# Estrategia: distribuir 10 productos en 16 shelves (algunos repetidos)
# Ejemplo: cada Shelf tiene 4-6 productos
# ============================================================================

log "=== CREANDO INVENTORY ITEMS ==="

# Madrid Shelves - cada Shelf 4-5 productos unicos
# Shelf A1: Prod1,2,3,4
# Shelf A2: Prod1,5,6,7
# Shelf A3: Prod2,4,8,9
# Shelf A4: Prod3,5,9,10
# Barcelona Shelves (similar distribucion)
# Shelf B1: Prod1,4,6,8
# Shelf B2: Prod2,5,7,9
# Shelf B3: Prod3,6,8,10
# Shelf B4: Prod1,2,4,5
# Paris (cada Shelf 4 productos)
# Shelf C1: Prod1,3,5,7
# Shelf C2: Prod2,4,6,8
# Shelf C3: Prod3,7,9,10
# Shelf C4: Prod1,2,8,9
# Milan (cada Shelf 4 productos)
# Shelf D1: Prod1,5,8,10
# Shelf D2: Prod2,4,7,9
# Shelf D3: Prod3,5,6,10
# Shelf D4: Prod1,2,3,4

# Madrid A1: Productos 1,2,3,4 (shelfCount 5,4,3,4, stockCount=5,4,3,4 en este store)
ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a1-prod1",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:laptop-asus"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a1"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 5},
  "stockCount": {"type": "Number", "value": 5}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a1-prod2",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:monitor-lg"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a1"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 4},
  "stockCount": {"type": "Number", "value": 4}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a1-prod3",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:mouse-logitech"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a1"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 3},
  "stockCount": {"type": "Number", "value": 3}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a1-prod4",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:keyboard-mechanical"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a1"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 4},
  "stockCount": {"type": "Number", "value": 4}
}
EOF
)
post_entity "$ITEM"

# Madrid A2: Productos 1,5,6,7
ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a2-prod1",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:laptop-asus"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a2"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 3},
  "stockCount": {"type": "Number", "value": 8}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a2-prod5",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:headphones-sony"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a2"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 2},
  "stockCount": {"type": "Number", "value": 2}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a2-prod6",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:webcam-logitech"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a2"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 4},
  "stockCount": {"type": "Number", "value": 4}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a2-prod7",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:usb-dock"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a2"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 3},
  "stockCount": {"type": "Number", "value": 3}
}
EOF
)
post_entity "$ITEM"

# Madrid A3: Productos 2,4,8,9
ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a3-prod2",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:monitor-lg"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a3"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 2},
  "stockCount": {"type": "Number", "value": 6}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a3-prod4",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:keyboard-mechanical"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a3"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 3},
  "stockCount": {"type": "Number", "value": 7}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a3-prod8",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:ssd-samsung"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a3"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 4},
  "stockCount": {"type": "Number", "value": 4}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a3-prod9",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:ram-corsair"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a3"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 5},
  "stockCount": {"type": "Number", "value": 5}
}
EOF
)
post_entity "$ITEM"

# Madrid A4: Productos 3,5,9,10
ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a4-prod3",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:mouse-logitech"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a4"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 6},
  "stockCount": {"type": "Number", "value": 9}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a4-prod5",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:headphones-sony"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a4"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 1},
  "stockCount": {"type": "Number", "value": 3}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a4-prod9",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:ram-corsair"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a4"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 3},
  "stockCount": {"type": "Number", "value": 8}
}
EOF
)
post_entity "$ITEM"

ITEM=$(cat <<'EOF'
{
  "id": "urn:ngsi-ld:InventoryItem:madrid-a4-prod10",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:power-supply"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:madrid-shelf-a4"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:madrid-centro"},
  "shelfCount": {"type": "Number", "value": 2},
  "stockCount": {"type": "Number", "value": 2}
}
EOF
)
post_entity "$ITEM"

# Barcelona Shelves
INVENTORY_BARCELONA='
{
  "id": "urn:ngsi-ld:InventoryItem:barcelona-b1-prod1",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:laptop-asus"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:barcelona-shelf-b1"},
  "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:barcelona-port"},
  "shelfCount": {"type": "Number", "value": 4},
  "stockCount": {"type": "Number", "value": 4}
}
'
post_entity "$INVENTORY_BARCELONA"

# [Mas items Barcelona B1...]
INVENTORY_BARCELONA='{"id": "urn:ngsi-ld:InventoryItem:barcelona-b1-prod4", "type": "InventoryItem", "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:keyboard-mechanical"}, "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:barcelona-shelf-b1"}, "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:barcelona-port"}, "shelfCount": {"type": "Number", "value": 3}, "stockCount": {"type": "Number", "value": 3}}'
post_entity "$INVENTORY_BARCELONA"

INVENTORY_BARCELONA='{"id": "urn:ngsi-ld:InventoryItem:barcelona-b1-prod6", "type": "InventoryItem", "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:webcam-logitech"}, "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:barcelona-shelf-b1"}, "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:barcelona-port"}, "shelfCount": {"type": "Number", "value": 5}, "stockCount": {"type": "Number", "value": 5}}'
post_entity "$INVENTORY_BARCELONA"

INVENTORY_BARCELONA='{"id": "urn:ngsi-ld:InventoryItem:barcelona-b1-prod8", "type": "InventoryItem", "refProduct": {"type": "Relationship", "value": "urn:ngsi-ld:Product:ssd-samsung"}, "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:barcelona-shelf-b1"}, "refStore": {"type": "Relationship", "value": "urn:ngsi-ld:Store:barcelona-port"}, "shelfCount": {"type": "Number", "value": 2}, "stockCount": {"type": "Number", "value": 2}}'
post_entity "$INVENTORY_BARCELONA"

# Helpers para mapear producto y generar items en lote por shelf.
product_urn_from_num() {
  case "$1" in
    1) echo "urn:ngsi-ld:Product:laptop-asus" ;;
    2) echo "urn:ngsi-ld:Product:monitor-lg" ;;
    3) echo "urn:ngsi-ld:Product:mouse-logitech" ;;
    4) echo "urn:ngsi-ld:Product:keyboard-mechanical" ;;
    5) echo "urn:ngsi-ld:Product:headphones-sony" ;;
    6) echo "urn:ngsi-ld:Product:webcam-logitech" ;;
    7) echo "urn:ngsi-ld:Product:usb-dock" ;;
    8) echo "urn:ngsi-ld:Product:ssd-samsung" ;;
    9) echo "urn:ngsi-ld:Product:ram-corsair" ;;
    10) echo "urn:ngsi-ld:Product:power-supply" ;;
    *) return 1 ;;
  esac
}

create_inventory_for_shelf() {
  local store_slug="$1"
  local store_urn="$2"
  local shelf_id="$3"
  local products_csv="$4"
  local shelf_count_base="$5"
  local index=0

  IFS=',' read -ra products <<< "$products_csv"
  for prod_num in "${products[@]}"; do
    local prod_urn
    local shelf_count
    local stock_count
    prod_urn=$(product_urn_from_num "$prod_num") || {
      log "[ERROR] Producto no soportado en mapping: $prod_num"
      exit 1
    }

    # shelfCount positivo y visible para UI (stockCount >= shelfCount)
    shelf_count=$((shelf_count_base + (index % 2)))
    stock_count=$((shelf_count + 2))

    ITEM=$(cat <<EOF
{
  "id": "urn:ngsi-ld:InventoryItem:${store_slug}-$(echo "$shelf_id" | sed 's/.*-shelf-//')-prod${prod_num}",
  "type": "InventoryItem",
  "refProduct": {"type": "Relationship", "value": "${prod_urn}"},
  "refShelf": {"type": "Relationship", "value": "urn:ngsi-ld:Shelf:${shelf_id}"},
  "refStore": {"type": "Relationship", "value": "${store_urn}"},
  "shelfCount": {"type": "Number", "value": ${shelf_count}},
  "stockCount": {"type": "Number", "value": ${stock_count}}
}
EOF
)
    post_entity "$ITEM"
    index=$((index + 1))
  done
}

# Barcelona B2-B4 (4 productos por shelf)
create_inventory_for_shelf "barcelona" "urn:ngsi-ld:Store:barcelona-port" "barcelona-shelf-b2" "2,5,7,9" 4
create_inventory_for_shelf "barcelona" "urn:ngsi-ld:Store:barcelona-port" "barcelona-shelf-b3" "3,6,8,10" 4
create_inventory_for_shelf "barcelona" "urn:ngsi-ld:Store:barcelona-port" "barcelona-shelf-b4" "1,2,4,5" 4

# Paris C1-C4 (4 productos por shelf)
create_inventory_for_shelf "paris" "urn:ngsi-ld:Store:paris-nord" "paris-shelf-c1" "1,3,5,7" 3
create_inventory_for_shelf "paris" "urn:ngsi-ld:Store:paris-nord" "paris-shelf-c2" "2,4,6,8" 3
create_inventory_for_shelf "paris" "urn:ngsi-ld:Store:paris-nord" "paris-shelf-c3" "3,7,9,10" 3
create_inventory_for_shelf "paris" "urn:ngsi-ld:Store:paris-nord" "paris-shelf-c4" "1,2,8,9" 3

# Milan D1-D4 (4 productos por shelf)
create_inventory_for_shelf "milano" "urn:ngsi-ld:Store:milano-sud" "milano-shelf-d1" "1,5,8,10" 3
create_inventory_for_shelf "milano" "urn:ngsi-ld:Store:milano-sud" "milano-shelf-d2" "2,4,7,9" 3
create_inventory_for_shelf "milano" "urn:ngsi-ld:Store:milano-sud" "milano-shelf-d3" "3,5,6,10" 3
create_inventory_for_shelf "milano" "urn:ngsi-ld:Store:milano-sud" "milano-shelf-d4" "1,2,3,4" 3

log "=== Importacion de datos completada ==="
log "Verificar en Orion: curl http://localhost:1026/v2/entities"

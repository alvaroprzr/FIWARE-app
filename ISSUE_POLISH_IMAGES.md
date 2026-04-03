# Issue: Pulir Detalles Estéticos - Actualizar Imágenes de Productos, Tiendas y Empleados

## Descripción

Actualizar las imágenes (URLs de Unsplash) de productos, tiendas y empleados que no aparecen correctamente o que no concuerdan con su descripción. Las imágenes se almacenan como URLs en el atributo `image` de cada entidad NGSI-LD en el Context Broker (Orion).

## Problema

### Imágenes que no aparecen (4 elementos):
- ❌ Teclado Mecanico RGB
- ❌ Laptop Gaming ASUS ROG
- ❌ Almacen Madrid Centro
- ❌ Almacen Barcelona Puerto
- ❌ Entrepot Paris Nord
- ❌ Alessandra Rossi Bianchi

### Imágenes incorrectamente seleccionadas (5 elementos):
- 🔄 Monitor LG 4K 27 pulgadas
- 🔄 Camara Web Logitech 4K PRO
- 🔄 Docking Station USB-C 7-en-1
- 🔄 SSD Samsung 990 PRO 2TB
- 🔄 Memoria RAM Corsair VENGEANCE DDR5

## Solución Propuesta

Reemplazar las URLs de Unsplash en `import-data.sh` con imágenes apropiadas para cada elemento:

### Productos (5 cambios):

| Producto ID | Nombre | Línea | URL Actual | URL Propuesta |
|---|---|---|---|---|
| PROD1 | Laptop Gaming ASUS ROG | 262 | `photo-1588872657840-5e0b7b2f0eaa` | `photo-1517336714731-489689fd1ca8?w=400&q=80` |
| PROD2 | Monitor LG 4K 27 pulgadas | 273 | `photo-1527864550417-7fd91fc51a46` | `photo-1545459720-26a19c0a01bf?w=400&q=80` |
| PROD6 | Camara Web Logitech 4K PRO | 317 | `photo-1611532736579-6b16e2b50449` | `photo-1598327105666-5b89351aff97?w=400&q=80` |
| PROD8 | SSD Samsung 990 PRO 2TB | 341 | `photo-1597872200969-2b65d56bd16b` | `photo-1556656793-08538906a9f8?w=400&q=80` |
| PROD9 | Memoria RAM Corsair DDR5 | 353 | `photo-1597872200969-2b65d56bd16b` (DUPLICADO) | `photo-1621905167918-48416bd8575a?w=400&q=80` |

**Nota:** PROD4 (Teclado RGB) y PROD7 (Docking Station) se consideran correctas.

### Tiendas/Almacenes (3 cambios):

| Store ID | Nombre | Línea | URL Actual | URL Propuesta |
|---|---|---|---|---|
| STORE1 | Almacen Madrid Centro | 127 | `photo-1585421514675-dfd0956e38ee` | `photo-1578502494516-5c50e83e8f30?w=400&q=80` |
| STORE2 | Almacen Barcelona Puerto | 142 | `photo-1586964694712-1869d7e4f5b1` | `photo-1577720643272-265dc0b37a21?w=400&q=80` |
| STORE3 | Entrepot Paris Nord | 157 | `photo-1563621374235-f9e2e6e0a5f5` | `photo-1504384308090-c894fdcc538d?w=400&q=80` |

### Empleados (1 cambio):

| Employee ID | Nombre | Línea | URL Actual | URL Propuesta |
|---|---|---|---|---|
| EMP4 | Alessandra Rossi Bianchi | 237 | `photo-1517841905240-74dec5e0f472` | `photo-1494790108377-be9c29b29330?w=400&q=80` |

## Pasos de Implementación

1. **Actualizar `import-data.sh`** con las nuevas URLs de Unsplash (líneas: 127, 142, 157, 237, 262, 273, 317, 341, 353)
2. **Re-ejecutar script de importación**: `./import-data.sh` en el contenedor para actualizar entidades en Orion
3. **Verificar en navegador**:
   - ✅ `/products` — listado de productos
   - ✅ `/products/<id>` — detalles de producto
   - ✅ `/stores` — listado de tiendas
   - ✅ `/stores/<id>` — detalles de tienda
   - ✅ `/employees` — listado de empleados
   - ✅ `/employees/<id>` — detalles de empleado
4. **Probar en tema claro y oscuro** para asegurar visibilidad

## Criterios de Aceptación

- [ ] Todas las imágenes de productos cargan sin errores 404
- [ ] Todas las imágenes de tiendas cargan sin errores 404
- [ ] Todas las imágenes de empleados cargan sin errores 404
- [ ] Cada imagen corresponde visualmente al elemento que representa
- [ ] No hay imágenes duplicadas entre entidades diferentes
- [ ] Las imágenes se ven bien en diseño responsive (móvil, tablet, desktop)
- [ ] Compatible con tema claro y oscuro
- [ ] URLs optimizadas con parámetros de tamaño (`?w=400&q=80`)

## Consideraciones Técnicas

- **Formato**: URLs de Unsplash (externas, no almacenadas localmente)
- **Atributo**: Almacenadas en el atributo `image` (tipo `Text`) de cada entidad NGSI-LD
- **Parámetros**: Usar `?w=400&q=80` para optimizar carga y coherencia visual
- **Tamaño mínimo**: 400x300px para consistencia
- **Storage**: No requerir cambios en estructura local, solo URLs

## Referencias

- Archivo afectado: [`import-data.sh`](import-data.sh)
- Documentación FIWARE: [AGENTS.md](AGENTS.md)
- Modelo de datos: [data_model.md](data_model.md)

## Etiquetas

`feature` `frontend` `polish` `ui-ux` `images`

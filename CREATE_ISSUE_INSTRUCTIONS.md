# 📋 Crear Issue en GitHub - Instrucciones

## Opción 1: Automatizado con GitHub CLI (Recomendado)

### Paso 1: Instalar GitHub CLI (si no está instalado)
```bash
# En Ubuntu/Debian:
sudo apt-get install gh

# Verificar instalación:
gh --version
```

### Paso 2: Autenticarse con GitHub
```bash
gh auth login
# Selecciona:
# - GitHub.com
# - HTTPS
# - Authenticate Git with your GitHub credentials? → Y
# - Paste an authentication token → (pega tu token personal de GitHub)
```

**¿Cómo obtener un token personal de GitHub?**
1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token"
3. Dale permisos: `repo` (acceso completo a repositorios)
4. Copia el token y pégalo en el terminal

### Paso 3: Crear el issue automáticamente
```bash
cd /home/pablo/xdei/Practica2/FIWARE-app
./create-image-issue.sh
```

El script creará automáticamente el issue en GitHub con:
- ✅ Título descriptivo
- ✅ Descripción detallada
- ✅ Etiquetas: `feature`, `frontend`, `polish`, `ui-ux`
- ✅ Tabla de cambios propuestos
- ✅ Criterios de aceptación

---

## Opción 2: Manual en el Navegador

1. **Ve a la página de crear issue:**
   https://github.com/alvaroprzr/FIWARE-app/issues/new

2. **Copia el título:**
   ```
   Pulir Detalles Estéticos: Actualizar Imágenes de Productos, Tiendas y Empleados
   ```

3. **Copia la descripción desde:**
   - Archivo local: `ISSUE_POLISH_IMAGES.md`
   - O desde: [ISSUE_POLISH_IMAGES.md](ISSUE_POLISH_IMAGES.md)

4. **Agrega etiquetas:**
   - `feature`
   - `frontend`
   - `polish`
   - `ui-ux`

5. **Click en "Submit new issue"**

---

## Opción 3: Obtener el Contenido Formateado

El contenido completo del issue está disponible en:
```
./ISSUE_POLISH_IMAGES.md
```

Puedes:
- Copiar el contenido completo
- Pegarlo en GitHub manualmente
- Usarlo como referencia

---

## ✅ Verificación

Después de crear el issue:
1. Anota el número del issue (ej: #42)
2. Crea una rama local: `git checkout -b feature/issue-<número>-actualizar-imagenes`
3. Comienza la implementación siguiendo el plan
4. Commit: `git commit -m "feat(#<número>): Actualizar URLs de imágenes en import-data.sh"`

---

## 📚 Referencia

- AGENTS.md - Guía completa de GitHub Flow
- ISSUE_POLISH_IMAGES.md - Contenido detallado del issue
- create-image-issue.sh - Script automatizado

#!/bin/bash
# Script para crear Issue #1 en GitHub remoto
# Este script proporciona instrucciones ya que GH CLI no está disponible

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║ Creación de Issue #1 en GitHub - INSTRUCCIONES MANUALES          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo

echo "📍 Repositorio remoto detectado:"
git remote -v | grep origin
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPCIÓN 1: Crear Issue vía Web (Recomendado)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "1. Abrir en navegador: https://github.com/alvaroprzr/FIWARE-app/issues/new"
echo
echo "2. Completar formulario con:"
echo "   Título: Issue #1: Implementación inicial completa"
echo
echo "3. Cuerpo del issue (copiar contenido de ISSUE_1_CONTENT.md)"
echo
echo "4. Presionar 'Submit new issue'"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPCIÓN 2: Instalar GitHub CLI e crear con comando"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "Instalar GitHub CLI (si no está disponible):"
echo "  Ubuntu/Debian: sudo apt-get install gh"
echo "  macOS: brew install gh"
echo
echo "Luego ejecutar:"
echo "  gh auth login  # Una sola vez para autenticarse"
echo "  gh issue create --title 'Issue #1: Implementación inicial completa' \\"
echo "    --body-file ISSUE_1_CONTENT.md \\"
echo "    --repo alvaroprzr/FIWARE-app"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPCIÓN 3: Cerrar Issue vía Git (después de crear)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "Una vez creado el issue (ej: Issue #1), hacer commit que lo cierre:"
echo
echo "  git commit --allow-empty -m 'Close #1'"
echo "  git push origin main"
echo
echo "Esto cierra automáticamente el issue al pushear a main."
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Contenido del Issue disponible en: ISSUE_1_CONTENT.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

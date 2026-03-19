/**
 * Main JavaScript - Core functionality
 * - i18n (Internationalization)
 * - Dark/Light theme toggle
 * - Socket.IO integration
 * - Notifications
 */

// ============================================================================
// Internationalization (i18n)
// ============================================================================

const i18n = {
    es: {
        'nav.home': 'Inicio',
        'nav.stores': 'Almacenes',
        'nav.products': 'Productos',
        'nav.employees': 'Empleados',
        'lang.spanish': 'Español',
        'lang.english': 'English',
        'notifications.title': 'Notificaciones',
        'footer.text': 'Almacén Inteligente FIWARE © 2024',
        'footer.connecting': 'Conectando...',
        'home.title': 'Almacén Inteligente FIWARE',
        'home.subtitle': 'Sistema de gestión de inventario basado en NGSIv2',
        'home.stores': 'Almacenes',
        'home.products': 'Productos',
        'home.shelves': 'Estanterías',
        'home.employees': 'Empleados',
        'home.inventory': 'Items de Inventario',
        'home.total': 'Total de Entidades',
        'home.data_model': 'Modelo de Datos',
        'home.quick_links': 'Enlaces Rápidos',
        'home.view_stores': 'Ver Almacenes',
        'home.global_map': 'Mapa Global',
        'home.view_products': 'Ver Productos',
        'home.view_employees': 'Ver Empleados',
        'home.api_docs': 'Documentación API',
        'home.api_stats': 'Obtener estadísticas del sistema',
        'home.api_stores': 'Listar almacenes en JSON',
        'home.api_products': 'Listar productos en JSON',
        'home.api_employees': 'Listar empleados en JSON',
        'products.title': 'Catálogo de Productos',
        'products.add': '+ Añadir Producto',
        'products.view': 'Ver',
        'product.inventory_distribution': 'Distribución de Inventario',
        'product.store': 'Almacén',
        'product.shelf': 'Estantería',
        'product.shelf_count': 'Cantidad Estante',
        'product.stock_count': 'Stock Total',
        'stores.title': 'Almacenes',
        'stores.view_map': 'Ver Mapa',
        'store.climate': 'Clima del Almacén',
        'store.temperature': 'Temperatura',
        'store.humidity': 'Humedad Relativa',
        'store.visualization': 'Visualización 3D',
        'store.location': 'Ubicación',
        'store.inventory': 'Inventario',
        'store.inventory_details': 'Detalles de Inventario',
        'store.employees': 'Personal',
        'store.actions': 'Acciones',
        'store.buy': 'Comprar',
        'employees.title': 'Equipo de Trabajo',
        'employee.skills': 'Competencias',
        'employee.details': 'Detalles de Empleo',
        'employee.hire_date': 'Fecha de Contratación',
        'employee.category': 'Categoría',
        'map.title': 'Mapa Global de Almacenes',
        'error.title': 'Error',
        'error.back_home': 'Volver al Inicio'
    },
    en: {
        'nav.home': 'Home',
        'nav.stores': 'Stores',
        'nav.products': 'Products',
        'nav.employees': 'Employees',
        'lang.spanish': 'Español',
        'lang.english': 'English',
        'notifications.title': 'Notifications',
        'footer.text': 'Smart Warehouse FIWARE © 2024',
        'footer.connecting': 'Connecting...',
        'home.title': 'FIWARE Smart Warehouse',
        'home.subtitle': 'Inventory management system based on NGSIv2',
        'home.stores': 'Stores',
        'home.products': 'Products',
        'home.shelves': 'Shelves',
        'home.employees': 'Employees',
        'home.inventory': 'Inventory Items',
        'home.total': 'Total Entities',
        'home.data_model': 'Data Model',
        'home.quick_links': 'Quick Links',
        'home.view_stores': 'View Stores',
        'home.global_map': 'Global Map',
        'home.view_products': 'View Products',
        'home.view_employees': 'View Employees',
        'home.api_docs': 'API Documentation',
        'home.api_stats': 'Get system statistics',
        'home.api_stores': 'List stores in JSON',
        'home.api_products': 'List products in JSON',
        'home.api_employees': 'List employees in JSON',
        'products.title': 'Product Catalog',
        'products.add': '+ Add Product',
        'products.view': 'View',
        'product.inventory_distribution': 'Inventory Distribution',
        'product.store': 'Store',
        'product.shelf': 'Shelf',
        'product.shelf_count': 'Shelf Quantity',
        'product.stock_count': 'Total Stock',
        'stores.title': 'Stores',
        'stores.view_map': 'View Map',
        'store.climate': 'Store Climate',
        'store.temperature': 'Temperature',
        'store.humidity': 'Relative Humidity',
        'store.visualization': '3D Visualization',
        'store.location': 'Location',
        'store.inventory': 'Inventory',
        'store.inventory_details': 'Inventory Details',
        'store.employees': 'Staff',
        'store.actions': 'Actions',
        'store.buy': 'Buy',
        'employees.title': 'Team',
        'employee.skills': 'Skills',
        'employee.details': 'Employment Details',
        'employee.hire_date': 'Hire Date',
        'employee.category': 'Category',
        'map.title': 'Global Store Map',
        'error.title': 'Error',
        'error.back_home': 'Back to Home'
    }
};

let currentLanguage = localStorage.getItem('language') || 'es';

function t(key) {
    return i18n[currentLanguage]?.[key] || key;
}

function updateUIText() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        elem.textContent = t(key);
    });
}

document.getElementById('language-selector')?.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    updateUIText();
});

// ============================================================================
// Dark/Light Theme Toggle
// ============================================================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    
    if (isDark) {
        document.body.classList.add('dark-theme');
    }
    
    updateThemeToggleButton();
}

function updateThemeToggleButton() {
    const btn = document.getElementById('theme-toggle');
    const isDark = document.body.classList.contains('dark-theme');
    if (btn) {
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeToggleButton();
});

// ============================================================================
// Initialize on page load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    updateLanguageSelector();
    updateUIText();
});

function updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = currentLanguage;
    }
}

// ============================================================================
// Notification helpers
// ============================================================================

function showNotification(title, message, level = 'info') {
    const list = document.getElementById('notifications-list');
    if (!list) return;
    
    const item = document.createElement('div');
    item.className = `notification-item ${level}`;
    item.innerHTML = `
        <i class="fas fa-${getIcon(level)}"></i>
        <div>
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    list.prepend(item);
    
    // Update badge
    const badge = document.getElementById('notification-count');
    if (badge) {
        badge.textContent = parseInt(badge.textContent || 0) + 1;
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => item.remove(), 5000);
}

function getIcon(level) {
    switch (level) {
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'success': return 'check-circle';
        default: return 'info-circle';
    }
}

// ============================================================================
// Mermaid initialization
// ============================================================================

if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
    mermaid.contentLoaded();
}

// ============================================================================
// Inventory Item "Buy" Button Functionality
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Attach click handlers to all buy buttons
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const inventoryItemId = button.getAttribute('data-inventoryitem-id');
            const shelfCount = parseInt(button.getAttribute('data-shelf-count')) || 0;
            const stockCount = parseInt(button.getAttribute('data-stock-count')) || 0;
            
            // Validate shelf count
            if (shelfCount <= 0) {
                showNotification('Sin Stock', 'No hay disponible en esta ubicación', 'warning');
                return;
            }
            
            // Make PATCH request to Orion
            await buyInventoryItem(inventoryItemId, shelfCount, stockCount);
        });
    });
});

/**
 * Execute PATCH request to Orion to decrement inventory
 */
async function buyInventoryItem(inventoryItemId, currentShelfCount, currentStockCount) {
    try {
        const newShelfCount = currentShelfCount - 1;
        const newStockCount = currentStockCount - 1;
        
        const body = {
            shelfCount: {
                type: 'Number',
                value: newShelfCount
            },
            stockCount: {
                type: 'Number',
                value: newStockCount
            }
        };
        
        console.log(`[BUY] Sending PATCH to ${inventoryItemId}`, body);
        
        const response = await fetch(`http://localhost:1026/v2/entities/${inventoryItemId}/attrs`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            console.log(`[BUY] Success for ${inventoryItemId}`);
            updateInventoryItemUI(inventoryItemId, newShelfCount, newStockCount);
            showNotification('Compra Exitosa', 'Stock actualizado en tiempo real', 'success');
        } else {
            console.error(`[BUY] PATCH failed with status ${response.status}`);
            showNotification('Error', `No se pudo actualizar el stock (HTTP ${response.status})`, 'error');
        }
    } catch (error) {
        console.error('[BUY] Error:', error);
        showNotification('Error de Conexión', `No se pudo conectar a Orion: ${error.message}`, 'error');
    }
}

/**
 * Update UI to reflect new inventory counts without page reload
 */
function updateInventoryItemUI(inventoryItemId, newShelfCount, newStockCount) {
    // Find the button element
    const button = document.querySelector(`[data-inventoryitem-id="${inventoryItemId}"]`);
    if (!button) {
        console.warn(`[UPDATE] Button not found for ${inventoryItemId}`);
        return;
    }
    
    const tr = button.closest('tr');
    if (!tr) {
        console.warn(`[UPDATE] Table row not found for ${inventoryItemId}`);
        return;
    }
    
    // Update the Stock column (6th column, index 5)
    const stockCell = tr.querySelector('td:nth-child(6)');
    if (stockCell) {
        stockCell.textContent = Math.max(0, newStockCount);
    }
    
    // Update the Shelf Quantity column (7th column, index 6)
    const shelfCell = tr.querySelector('td:nth-child(7)');
    if (shelfCell) {
        shelfCell.textContent = Math.max(0, newShelfCount);
    }
    
    // Update button attributes and state
    button.setAttribute('data-shelf-count', Math.max(0, newShelfCount));
    button.setAttribute('data-stock-count', Math.max(0, newStockCount));
    
    // Disable button if shelf count <= 0
    if (newShelfCount <= 0) {
        button.disabled = true;
        button.classList.add('disabled');
    }
    
    console.log(`[UPDATE] UI updated for ${inventoryItemId}`);
}

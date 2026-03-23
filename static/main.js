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
        'nav.stores_map': 'Mapa Stores',
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
        'product.add_inventory_item': 'Añadir InventoryItem',
        'product.available_shelf': 'Estantería disponible',
        'product.select_shelf': 'Selecciona una estantería',
        'product.no_available_shelves': 'No hay estanterías disponibles para este producto',
        'stores.title': 'Almacenes',
        'stores.add': '+ Añadir Almacén',
        'stores.view_map': 'Ver Mapa',
        'store.climate': 'Clima del Almacén',
        'store.temperature': 'Temperatura',
        'store.humidity': 'Humedad Relativa',
        'store.visualization': 'Visualización 3D',
        'store.location': 'Ubicación',
        'store.inventory': 'Inventario',
        'store.inventory_details': 'Detalles de Inventario',
        'store.tweets': 'Tweets',
        'store.no_tweets': 'No hay tweets disponibles',
        'store.realtime_notifications': 'Notificaciones en tiempo real',
        'store.no_notifications': 'No hay notificaciones recientes',
        'store.employees': 'Personal',
        'store.actions': 'Acciones',
        'store.buy': 'Comprar',
        'store.add_shelf': 'Añadir Shelf',
        'store.edit_shelf': 'Modificar',
        'store.add_product': 'Añadir producto',
        'store.shelf_name': 'Nombre',
        'store.shelf_capacity': 'Capacidad máxima',
        'store.cancel': 'Cancelar',
        'store.save': 'Guardar',
        'store.product': 'Producto',
        'store.select_product': 'Selecciona un producto',
        'store.no_products_in_shelf': 'No hay productos en esta shelf',
        'store.units_on_shelf': 'unidades en shelf',
        'store.table.image': 'Imagen',
        'store.table.name': 'Nombre',
        'store.table.price': 'Precio',
        'store.table.size': 'Tamaño',
        'store.table.color': 'Color',
        'store.table.stock': 'stockCount',
        'store.table.shelf': 'shelfCount',
        'employees.title': 'Equipo de Trabajo',
        'employees.add': '+ Añadir Empleado',
        'employee.skills': 'Competencias',
        'employee.details': 'Detalles de Empleo',
        'employee.hire_date': 'Fecha de Contratación',
        'employee.category': 'Categoría',
        'map.title': 'Mapa Global de Almacenes',
        'error.title': 'Error',
        'error.back_home': 'Volver al Inicio',
        'form.error.required': 'Este campo es requerido.',
        'form.error.invalid_email': 'Por favor ingresa un correo válido.',
        'form.error.invalid_tel': 'Formato de teléfono inválido. Usa: +34 91 234 5678',
        'form.error.invalid_url': 'Por favor ingresa una URL válida.',
        'form.error.too_short': 'El valor es demasiado corto.',
        'form.error.pattern': 'Formato inválido.',
        'form.error.range': 'Valor fuera de rango permitido.',
        'form.error.password_mismatch': 'Las contraseñas no coinciden.',
        'form.error.skills_required': 'Selecciona al menos una competencia.'
    },
    en: {
        'nav.home': 'Home',
        'nav.stores': 'Stores',
        'nav.products': 'Products',
        'nav.employees': 'Employees',
        'nav.stores_map': 'Stores Map',
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
        'product.add_inventory_item': 'Add InventoryItem',
        'product.available_shelf': 'Available shelf',
        'product.select_shelf': 'Select a shelf',
        'product.no_available_shelves': 'No available shelves for this product',
        'stores.title': 'Stores',
        'stores.add': '+ Add Store',
        'stores.view_map': 'View Map',
        'store.climate': 'Store Climate',
        'store.temperature': 'Temperature',
        'store.humidity': 'Relative Humidity',
        'store.visualization': '3D Visualization',
        'store.location': 'Location',
        'store.inventory': 'Inventory',
        'store.inventory_details': 'Inventory Details',
        'store.tweets': 'Tweets',
        'store.no_tweets': 'No tweets available',
        'store.realtime_notifications': 'Real-time notifications',
        'store.no_notifications': 'No recent notifications',
        'store.employees': 'Staff',
        'store.actions': 'Actions',
        'store.buy': 'Buy',
        'store.add_shelf': 'Add Shelf',
        'store.edit_shelf': 'Edit',
        'store.add_product': 'Add product',
        'store.shelf_name': 'Name',
        'store.shelf_capacity': 'Max capacity',
        'store.cancel': 'Cancel',
        'store.save': 'Save',
        'store.product': 'Product',
        'store.select_product': 'Select a product',
        'store.no_products_in_shelf': 'There are no products in this shelf',
        'store.units_on_shelf': 'units on shelf',
        'store.table.image': 'Image',
        'store.table.name': 'Name',
        'store.table.price': 'Price',
        'store.table.size': 'Size',
        'store.table.color': 'Color',
        'store.table.stock': 'stockCount',
        'store.table.shelf': 'shelfCount',
        'employees.title': 'Team',
        'employees.add': '+ Add Employee',
        'employee.skills': 'Skills',
        'employee.details': 'Employment Details',
        'employee.hire_date': 'Hire Date',
        'employee.category': 'Category',
        'map.title': 'Global Store Map',
        'error.title': 'Error',
        'error.back_home': 'Back to Home',
        'form.error.required': 'This field is required.',
        'form.error.invalid_email': 'Please enter a valid email address.',
        'form.error.invalid_tel': 'Invalid phone format. Use: +34 91 234 5678',
        'form.error.invalid_url': 'Please enter a valid URL.',
        'form.error.too_short': 'Value is too short.',
        'form.error.pattern': 'Invalid format.',
        'form.error.range': 'Value is outside the allowed range.',
        'form.error.password_mismatch': 'Passwords do not match.',
        'form.error.skills_required': 'Select at least one skill.'
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

    document.documentElement.lang = currentLanguage;
    document.dispatchEvent(new CustomEvent('app:language-changed', {
        detail: { language: currentLanguage }
    }));
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
    document.dispatchEvent(new CustomEvent('app:theme-changed', {
        detail: { theme: isDark ? 'dark' : 'light' }
    }));
});

// ============================================================================
// Initialize on page load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    updateLanguageSelector();
    updateUIText();
    initializeNavbarActive();
    initializeStoreDetailForms();
    initializeProductDetailForms();
    initializeRealtimeNotifications();
});

function updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = currentLanguage;
    }
}

function initializeNavbarActive() {
    const currentPath = window.location.pathname;
    const sectionMatchers = [
        { section: 'home', matches: (path) => path === '/' },
        { section: 'stores-map', matches: (path) => path === '/stores/map' },
        { section: 'products', matches: (path) => path.startsWith('/products') },
        { section: 'stores', matches: (path) => path.startsWith('/stores') && path !== '/stores/map' },
        { section: 'employees', matches: (path) => path.startsWith('/employees') }
    ];

    const activeSection = sectionMatchers.find((matcher) => matcher.matches(currentPath))?.section;
    if (!activeSection) {
        return;
    }

    const navLink = document.querySelector(`.nav-links [data-nav-section="${activeSection}"]`);
    if (navLink) {
        navLink.classList.add('active');
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

function formatPriceValue(value) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return value;
    }
    return parsed.toFixed(2);
}

function updateProductPriceUI(productId, newPrice) {
    if (!productId) return;

    const formatted = formatPriceValue(newPrice);
    document.querySelectorAll(`.product-price-cell[data-product-id="${productId}"]`).forEach((cell) => {
        const isDetailPrice = cell.classList.contains('price');
        const hasCurrency = isDetailPrice || cell.textContent.trim().startsWith('€');
        cell.textContent = hasCurrency ? `€${formatted}` : formatted;
    });
}

function appendStoreRealtimeNotification(title, message, level = 'info') {
    const list = document.getElementById('store-notifications-list');
    if (!list) return;

    const emptyState = list.querySelector('.store-notification-empty');
    if (emptyState) {
        emptyState.remove();
    }

    const item = document.createElement('div');
    item.className = `notification-item ${level}`;
    item.innerHTML = `
        <div>
            <strong>${title}</strong>
            <p>${message}</p>
            <small>${new Date().toLocaleTimeString()}</small>
        </div>
    `;
    list.prepend(item);
}

function initializeRealtimeNotifications() {
    const socket = window.appSocket || (typeof io !== 'undefined' ? io() : null);
    if (!socket || window.__realtimeHandlersReady) {
        return;
    }

    window.__realtimeHandlersReady = true;

    socket.on('price_change', (data) => {
        const productId = data?.product_id;
        const newPrice = data?.new_price;

        updateProductPriceUI(productId, newPrice);
        showNotification(
            'Cambio de Precio',
            `Producto ${productId} - Nuevo precio: €${formatPriceValue(newPrice)}`,
            'info'
        );
        appendStoreRealtimeNotification(
            'Cambio de Precio',
            `Producto ${productId} actualizado a €${formatPriceValue(newPrice)}`,
            'info'
        );
    });

    socket.on('low_stock', (data) => {
        const storeNotifications = document.getElementById('store-notifications-list');
        const currentStoreId = storeNotifications?.getAttribute('data-store-id');

        showNotification(
            'Stock Bajo',
            `Apenas ${data?.shelf_count} unidades en ${data?.shelf_id}`,
            'warning'
        );

        if (currentStoreId && data?.store_id === currentStoreId) {
            appendStoreRealtimeNotification(
                'Stock Bajo',
                `Producto ${data?.product_id} con ${data?.shelf_count} unidades en ${data?.shelf_id}`,
                'warning'
            );
        }
    });
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

            if (button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled')) {
                return;
            }
            
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
                type: 'Integer',
                value: { '$inc': -1 }
            },
            stockCount: {
                type: 'Integer',
                value: { '$inc': -1 }
            }
        };
        
        console.log(`[BUY] Sending PATCH to ${inventoryItemId}`, body);
        
        const response = await fetch(`/api/inventory-items/${encodeURIComponent(inventoryItemId)}/buy`, {
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

// ============================================================================
// Store Detail: Shelf and Inventory forms
// ============================================================================

function initializeStoreDetailForms() {
    const root = document.getElementById('store-detail-root');
    if (!root) {
        return;
    }

    const storeId = root.getAttribute('data-store-id');

    document.querySelectorAll('[data-open-modal]').forEach((button) => {
        button.addEventListener('click', async () => {
            const modalId = button.getAttribute('data-open-modal');
            if (modalId === 'edit-shelf-modal') {
                fillEditShelfForm(button);
            }
            if (modalId === 'add-product-modal') {
                await prepareAddProductForm(button);
            }
            openModal(modalId);
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', () => {
            closeModal(button.getAttribute('data-close-modal'));
        });
    });

    const addShelfForm = document.getElementById('add-shelf-form');
    if (addShelfForm) {
        addShelfForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addShelfForm);
            const payload = {
                name: formData.get('name'),
                maxCapacity: parseInt(formData.get('maxCapacity'), 10)
            };

            try {
                const response = await fetch(`/api/stores/${encodeURIComponent(storeId)}/shelves`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                showNotification('Shelf creada', 'Nueva shelf añadida correctamente', 'success');
                closeModal('add-shelf-modal');
                window.location.reload();
            } catch (error) {
                showNotification('Error', `No se pudo crear la shelf: ${error.message}`, 'error');
            }
        });
    }

    const editShelfForm = document.getElementById('edit-shelf-form');
    if (editShelfForm) {
        editShelfForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editShelfForm);
            const shelfId = formData.get('shelfId');
            const payload = {
                name: formData.get('name'),
                maxCapacity: parseInt(formData.get('maxCapacity'), 10)
            };

            try {
                const response = await fetch(`/api/shelves/${encodeURIComponent(shelfId)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                showNotification('Shelf actualizada', 'Cambios guardados correctamente', 'success');
                closeModal('edit-shelf-modal');
                window.location.reload();
            } catch (error) {
                showNotification('Error', `No se pudo actualizar la shelf: ${error.message}`, 'error');
            }
        });
    }

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addProductForm);
            const shelfId = formData.get('shelfId');
            const payload = {
                productId: formData.get('productId'),
                shelfCount: parseInt(formData.get('shelfCount'), 10),
                stockCount: parseInt(formData.get('stockCount'), 10)
            };

            try {
                const response = await fetch(`/api/shelves/${encodeURIComponent(shelfId)}/inventory-items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                showNotification('Producto añadido', 'InventoryItem creado correctamente', 'success');
                closeModal('add-product-modal');
                window.location.reload();
            } catch (error) {
                showNotification('Error', `No se pudo añadir el producto: ${error.message}`, 'error');
            }
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function initializeProductDetailForms() {
    const root = document.getElementById('product-detail-root');
    if (!root) {
        return;
    }

    document.querySelectorAll('[data-open-modal="add-inventory-modal"]').forEach((button) => {
        button.addEventListener('click', async () => {
            await prepareAddInventoryForm(button);
            openModal('add-inventory-modal');
        });
    });

    document.querySelectorAll('[data-close-modal="add-inventory-modal"]').forEach((button) => {
        button.addEventListener('click', () => {
            closeModal('add-inventory-modal');
        });
    });

    const form = document.getElementById('add-inventory-form');
    if (!form) {
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const shelfId = formData.get('shelfId');
        const shelfCount = parseInt(formData.get('shelfCount'), 10);
        const stockCount = shelfCount;

        if (Number.isNaN(shelfCount) || Number.isNaN(stockCount) || shelfCount <= 0 || stockCount <= 0) {
            showNotification('Error', 'Las cantidades deben ser mayores que 0', 'error');
            return;
        }

        if (shelfCount > stockCount) {
            showNotification('Error', 'shelfCount no puede ser mayor que stockCount', 'error');
            return;
        }

        const payload = {
            productId: formData.get('productId'),
            shelfCount,
            stockCount
        };

        try {
            const response = await fetch(`/api/shelves/${encodeURIComponent(shelfId)}/inventory-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            showNotification('InventoryItem creado', 'El producto se añadió correctamente a la estantería', 'success');
            closeModal('add-inventory-modal');
            window.location.reload();
        } catch (error) {
            showNotification('Error', `No se pudo crear el InventoryItem: ${error.message}`, 'error');
        }
    });
}

async function prepareAddInventoryForm(button) {
    const storeId = button.getAttribute('data-store-id') || '';
    const productId = button.getAttribute('data-product-id') || '';

    const select = document.getElementById('add-inventory-shelf-select');
    const productInput = document.getElementById('add-inventory-product-id');
    const storeInput = document.getElementById('add-inventory-store-id');

    if (!select || !productInput || !storeInput) {
        return;
    }

    productInput.value = productId;
    storeInput.value = storeId;

    select.innerHTML = `<option value="">${t('product.select_shelf')}</option>`;

    try {
        const response = await fetch(`/api/stores/${encodeURIComponent(storeId)}/available-shelves/${encodeURIComponent(productId)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        const availableShelves = data.available_shelves || [];
        if (!availableShelves.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = t('product.no_available_shelves');
            select.appendChild(option);
            return;
        }

        availableShelves.forEach((shelf) => {
            const option = document.createElement('option');
            option.value = shelf.id;
            option.textContent = shelf.name?.value || shelf.id;
            select.appendChild(option);
        });
    } catch (error) {
        showNotification('Error', `No se pudo cargar estanterías disponibles: ${error.message}`, 'error');
    }
}

function fillEditShelfForm(button) {
    const shelfIdField = document.getElementById('edit-shelf-id');
    const shelfNameField = document.getElementById('edit-shelf-name');
    const shelfCapacityField = document.getElementById('edit-shelf-capacity');

    if (!shelfIdField || !shelfNameField || !shelfCapacityField) {
        return;
    }

    shelfIdField.value = button.getAttribute('data-shelf-id') || '';
    shelfNameField.value = button.getAttribute('data-shelf-name') || '';
    shelfCapacityField.value = button.getAttribute('data-shelf-capacity') || 1;
}

async function prepareAddProductForm(button) {
    const shelfId = button.getAttribute('data-shelf-id') || '';
    const select = document.getElementById('add-product-select');
    const shelfIdField = document.getElementById('add-product-shelf-id');

    if (!select || !shelfIdField) {
        return;
    }

    shelfIdField.value = shelfId;
    select.innerHTML = `<option value="">${t('store.select_product')}</option>`;

    try {
        const response = await fetch(`/api/shelves/${encodeURIComponent(shelfId)}/available-products`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        const availableProducts = data.available_products || [];
        if (!availableProducts.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = t('store.no_products_in_shelf');
            select.appendChild(option);
            return;
        }

        availableProducts.forEach((product) => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name?.value || product.id;
            select.appendChild(option);
        });
    } catch (error) {
        showNotification('Error', `No se pudo cargar productos disponibles: ${error.message}`, 'error');
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
        button.classList.add('disabled');
        button.setAttribute('aria-disabled', 'true');
    } else {
        button.classList.remove('disabled');
        button.setAttribute('aria-disabled', 'false');
    }
    
    console.log(`[UPDATE] UI updated for ${inventoryItemId}`);
}

// ============================================================================
// Country Code to Emoji Flag Converter
// ============================================================================

const countryCodeToEmoji = {
    'ES': '🇪🇸',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'PT': '🇵🇹',
    'DE': '🇩🇪',
    'GB': '🇬🇧',
    'NL': '🇳🇱',
    'BE': '🇧🇪',
    'AT': '🇦🇹',
    'CH': '🇨🇭',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'DK': '🇩🇰',
    'FI': '🇫🇮',
    'PL': '🇵🇱',
    'CZ': '🇨🇿',
    'HU': '🇭🇺',
    'RO': '🇷🇴',
    'GR': '🇬🇷',
    'IE': '🇮🇪'
};

function convertCountryCodesToEmojis() {
    document.querySelectorAll('.flag-emoji[data-country]').forEach((el) => {
        const code = el.getAttribute('data-country');
        el.textContent = countryCodeToEmoji[code] || '🏳️';
    });
}

// ============================================================================
// Employee Category Icons Mapper
// ============================================================================

const categoryIconMap = {
    'Manager': 'fa-crown',
    'Assistant': 'fa-user-tie',
    'Operator': 'fa-industry',
    'Supervisor': 'fa-clipboard-check'
};

function applyCategoryIcons() {
    document.querySelectorAll('.category-badge[data-category]').forEach((el) => {
        const category = el.getAttribute('data-category');
        const icon = categoryIconMap[category] || 'fa-tag';
        const iconEl = el.querySelector('i');
        if (iconEl) {
            iconEl.className = `fas ${icon}`;
        }
    });
}

// ============================================================================
// Employee Skills Icons Mapper
// ============================================================================

const skillIconMap = {
    'MachineryDriving': 'fa-gears',
    'WritingReports': 'fa-file-text',
    'CustomerRelationships': 'fa-handshake'
};

function applySkillIcons() {
    document.querySelectorAll('.skill-icon[data-skill]').forEach((el) => {
        const skill = el.getAttribute('data-skill');
        const icon = skillIconMap[skill] || 'fa-star';
        const iconEl = el.querySelector('i');
        if (iconEl) {
            iconEl.className = `fas ${icon}`;
        }
    });
}

// ============================================================================
// Delete Button Handlers
// ============================================================================

function setupDeleteButtons() {
    document.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const entityId = btn.getAttribute('data-id');
            if (!entityId) return;
            
            // Determine entity type and endpoint from current URL or data attribute
            const currentPath = window.location.pathname;
            let endpoint = '';
            
            if (currentPath.includes('/products')) {
                endpoint = `/api/products/${entityId.split(':').pop()}`;
            } else if (currentPath.includes('/stores')) {
                endpoint = `/api/stores/${entityId.split(':').pop()}`;
            } else if (currentPath.includes('/employees')) {
                endpoint = `/api/employees/${entityId.split(':').pop()}`;
            }
            
            if (!endpoint) return;
            
            if (window.confirm('¿Estás seguro de que deseas borrar esta entidad? Esta acción no se puede deshacer.')) {
                fetch(endpoint, { method: 'DELETE' })
                    .then(r => {
                        if (r.ok) {
                            window.location.reload();
                        } else {
                            alert('Error al borrar. Intenta de nuevo.');
                        }
                    })
                    .catch(err => {
                        console.error('Delete error:', err);
                        alert('Error al conectar con el servidor.');
                    });
            }
        });
    });
}

// ============================================================================
// Load Stores for Datalist (Employee Form)
// ============================================================================

function loadStoresForDatalist() {
    const datalist = document.getElementById('stores-list');
    const refStoreInput = document.getElementById('refStore');
    
    if (!datalist || !refStoreInput) return;
    
    fetch('/api/stores')
        .then(r => r.json())
        .then(data => {
            const stores = data.stores || [];
            stores.forEach(store => {
                const option = document.createElement('option');
                const storeId = store.id ? store.id.split(':').pop() : '';
                const storeName = store.name ? store.name.value : storeId;
                option.value = storeId;
                option.label = storeName;
                datalist.appendChild(option);
            });
        })
        .catch(err => console.error('Error loading stores:', err));
}

// ============================================================================
// Form Validation Enhancements
// ============================================================================

function setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate-inline="true"]');

    const errorKeyFor = (el) => {
        if ((el.type === 'radio' || el.type === 'checkbox') && el.name) {
            return el.name;
        }
        return el.id || el.name;
    };

    const setFieldError = (el, message) => {
        const key = errorKeyFor(el);
        if (!key) return;
        const errorNode = document.querySelector(`.field-error[data-error-for="${key}"]`);
        if (errorNode) {
            errorNode.textContent = message || '';
        }
    };

    const clearFieldError = (el) => {
        setFieldError(el, '');
    };

    const messageFor = (el) => {
        if (el.validity.valueMissing) return t('form.error.required');
        if (el.type === 'email' && el.validity.typeMismatch) return t('form.error.invalid_email');
        if (el.type === 'tel' && el.validity.patternMismatch) return t('form.error.invalid_tel');
        if (el.type === 'url' && el.validity.typeMismatch) return t('form.error.invalid_url');
        if (el.validity.tooShort) return t('form.error.too_short');
        if (el.validity.patternMismatch) return t('form.error.pattern');
        if (el.validity.stepMismatch || el.validity.rangeOverflow || el.validity.rangeUnderflow) {
            return t('form.error.range');
        }
        return '';
    };

    forms.forEach((form) => {
        const controls = form.querySelectorAll('input, select, textarea');
        controls.forEach((el) => {
            el.addEventListener('input', () => {
                el.setCustomValidity('');
                clearFieldError(el);
            });
            el.addEventListener('change', () => {
                el.setCustomValidity('');
                clearFieldError(el);
            });
        });

        form.addEventListener('submit', (e) => {
            let valid = true;

            controls.forEach((el) => {
                el.setCustomValidity('');
                clearFieldError(el);
            });

            const matchInputs = form.querySelectorAll('input[data-match]');
            matchInputs.forEach((el) => {
                const target = form.querySelector(`#${el.getAttribute('data-match')}`);
                if (target && el.value !== target.value) {
                    el.setCustomValidity(t('form.error.password_mismatch'));
                }
            });

            const skillsBoxes = form.querySelectorAll('input[name="skills"]');
            if (skillsBoxes.length) {
                const checked = Array.from(skillsBoxes).some((cb) => cb.checked);
                if (!checked) {
                    valid = false;
                    setFieldError(skillsBoxes[0], t('form.error.skills_required'));
                }
            }

            controls.forEach((el) => {
                if (el.type === 'hidden') {
                    return;
                }

                if (!el.checkValidity()) {
                    valid = false;
                    const msg = el.validationMessage || messageFor(el);
                    setFieldError(el, msg || messageFor(el));
                }
            });

            if (!valid) {
                e.preventDefault();
            }
        });
    });
}

// ============================================================================
// Initialize all bindings on page load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    convertCountryCodesToEmojis();
    applyCategoryIcons();
    applySkillIcons();
    setupDeleteButtons();
    loadStoresForDatalist();
    setupFormValidation();
});

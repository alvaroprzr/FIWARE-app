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
        'notifications.dismiss': 'Cerrar notificacion',
        'notifications.clear_all': 'Borrar todas',
        'notifications.price_change_title': 'Cambio de Precio',
        'notifications.price_change_message': 'Producto {product} - Nuevo precio: €{price}',
        'notifications.low_stock_title': 'Stock Bajo en Almacen',
        'notifications.low_stock_message': 'Atencion: quedan {count} unidades de {product}',
        'notifications.local_low_stock_message': 'Atencion: quedan {count} unidades de {product}',
        'notifications.no_stock_title': 'Sin Stock',
        'notifications.no_stock_message': 'No hay disponible en esta ubicacion',
        'notifications.purchase_success_title': 'Compra Exitosa',
        'notifications.purchase_success_message': 'Stock actualizado en tiempo real',
        'notifications.error_title': 'Error',
        'notifications.connection_error_title': 'Error de Conexion',
        'notifications.update_stock_error_message': 'No se pudo actualizar el stock ({error})',
        'notifications.connect_orion_error_message': 'No se pudo conectar a Orion: {error}',
        'notifications.shelf_created_title': 'Shelf creada',
        'notifications.shelf_created_message': 'Nueva shelf anadida correctamente',
        'notifications.shelf_create_error_message': 'No se pudo crear la shelf: {error}',
        'notifications.shelf_updated_title': 'Shelf actualizada',
        'notifications.shelf_updated_message': 'Cambios guardados correctamente',
        'notifications.shelf_update_error_message': 'No se pudo actualizar la shelf: {error}',
        'notifications.product_added_title': 'Producto anadido',
        'notifications.product_added_message': 'InventoryItem creado correctamente',
        'notifications.product_add_error_message': 'No se pudo anadir el producto: {error}',
        'notifications.capacity_exceeded_message': 'No caben mas unidades en la estanteria. Capacidad: {capacity}, actuales: {current}, intentadas: {requested}, maximo que puedes anadir ahora: {maximumAllowed}',
        'notifications.shelf_absolute_limit_message': 'La capacidad maxima de una shelf no puede superar {limit} (4 columnas x 4 niveles x 2 profundidades).',
        'notifications.shelf_remaining_capacity_message': 'La shelf seleccionada solo admite {maximumAllowed} unidades adicionales en este momento.',
        'notifications.validation_positive_counts': 'Las cantidades deben ser mayores que 0',
        'notifications.validation_shelf_gt_stock': 'shelfCount no puede ser mayor que stockCount',
        'notifications.inventory_created_title': 'InventoryItem creado',
        'notifications.inventory_created_message': 'El producto se anadio correctamente a la estanteria',
        'notifications.inventory_create_error_message': 'No se pudo crear el InventoryItem: {error}',
        'notifications.load_shelves_error_message': 'No se pudo cargar estanterias disponibles: {error}',
        'notifications.load_products_error_message': 'No se pudo cargar productos disponibles: {error}',
        'notifications.deleted_title': 'Eliminado',
        'notifications.deleted_message': 'Entidad eliminada correctamente',
        'notifications.deleted_message_named': 'Elemento "{name}" eliminado correctamente',
        'notifications.delete_error_message': 'No se pudo eliminar la entidad',
        'notifications.server_connection_error_message': 'No se pudo conectar con el servidor.',
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
        'home.diagram_title': 'Diagrama de Entidad-Relacion',
        'home.diagram_toggle': 'Mostrar u ocultar diagrama',
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
        'products.actions': 'Acciones',
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
        'stores.actions': 'Acciones',
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
        'store.form.product_count': 'Numero de productos',
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
        'employees.actions': 'Acciones',
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
        'notifications.dismiss': 'Dismiss notification',
        'notifications.clear_all': 'Clear all',
        'notifications.price_change_title': 'Price Change',
        'notifications.price_change_message': 'Product {product} - New price: €{price}',
        'notifications.low_stock_title': 'Low Store Stock',
        'notifications.low_stock_message': 'Alert: {count} units of {product} remain',
        'notifications.local_low_stock_message': 'Alert: {count} units of {product} remain',
        'notifications.no_stock_title': 'Out of Stock',
        'notifications.no_stock_message': 'No units available in this location',
        'notifications.purchase_success_title': 'Purchase Successful',
        'notifications.purchase_success_message': 'Stock updated in real time',
        'notifications.error_title': 'Error',
        'notifications.connection_error_title': 'Connection Error',
        'notifications.update_stock_error_message': 'Could not update stock ({error})',
        'notifications.connect_orion_error_message': 'Could not connect to Orion: {error}',
        'notifications.shelf_created_title': 'Shelf created',
        'notifications.shelf_created_message': 'New shelf added successfully',
        'notifications.shelf_create_error_message': 'Could not create shelf: {error}',
        'notifications.shelf_updated_title': 'Shelf updated',
        'notifications.shelf_updated_message': 'Changes saved successfully',
        'notifications.shelf_update_error_message': 'Could not update shelf: {error}',
        'notifications.product_added_title': 'Product added',
        'notifications.product_added_message': 'Inventory item created successfully',
        'notifications.product_add_error_message': 'Could not add product: {error}',
        'notifications.capacity_exceeded_message': 'No more units fit in this shelf. Capacity: {capacity}, current: {current}, requested: {requested}, maximum you can add now: {maximumAllowed}',
        'notifications.shelf_absolute_limit_message': 'Shelf max capacity cannot exceed {limit} (4 columns x 4 levels x 2 depth slots).',
        'notifications.shelf_remaining_capacity_message': 'The selected shelf only allows {maximumAllowed} additional units right now.',
        'notifications.validation_positive_counts': 'Counts must be greater than 0',
        'notifications.validation_shelf_gt_stock': 'shelfCount cannot be greater than stockCount',
        'notifications.inventory_created_title': 'Inventory item created',
        'notifications.inventory_created_message': 'Product added to the shelf successfully',
        'notifications.inventory_create_error_message': 'Could not create inventory item: {error}',
        'notifications.load_shelves_error_message': 'Could not load available shelves: {error}',
        'notifications.load_products_error_message': 'Could not load available products: {error}',
        'notifications.deleted_title': 'Deleted',
        'notifications.deleted_message': 'Entity deleted successfully',
        'notifications.deleted_message_named': 'Item "{name}" deleted successfully',
        'notifications.delete_error_message': 'Could not delete entity',
        'notifications.server_connection_error_message': 'Could not connect to server.',
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
        'home.diagram_title': 'Entity-Relationship Diagram',
        'home.diagram_toggle': 'Show or hide diagram',
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
        'products.actions': 'Actions',
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
        'stores.actions': 'Actions',
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
        'store.form.product_count': 'Number of products',
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
        'employees.actions': 'Actions',
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
const notificationState = {
    unreadCount: 0,
    isPanelOpen: false,
    maxGlobalItems: 80,
    maxLocalItems: 20
};
const APP_BOOT_ID = window.appBootId || 'unknown-boot';
const GLOBAL_NOTIF_SESSION_KEY = `fiware.notifications.global.${APP_BOOT_ID}`;
const LOCAL_NOTIF_SESSION_KEY = `fiware.notifications.local.${APP_BOOT_ID}`;
const LOW_STOCK_DUP_WINDOW_MS = 5000;
const lowStockEventCache = new Map();

function clearLegacyNotificationStorage() {
    const keepKeys = new Set([GLOBAL_NOTIF_SESSION_KEY, LOCAL_NOTIF_SESSION_KEY]);
    const keysToDelete = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        if (!key.startsWith('fiware.notifications.')) continue;
        if (keepKeys.has(key)) continue;
        keysToDelete.push(key);
    }
    keysToDelete.forEach((key) => sessionStorage.removeItem(key));
}

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
    clearLegacyNotificationStorage();
    initializeTheme();
    updateLanguageSelector();
    updateUIText();
    initializeGlobalNotificationsPanel();
    initializeStoreNotificationPanel();
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

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function interpolate(template, values) {
    return Object.entries(values).reduce((acc, [key, val]) => {
        return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val ?? ''));
    }, template);
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEntityId(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
}

function normalizeComparableEntityId(value) {
    return normalizeEntityId(value).toLowerCase();
}

function extractEntitySuffix(entityId) {
    const normalized = normalizeComparableEntityId(entityId);
    if (!normalized) {
        return '';
    }
    const parts = normalized.split(':');
    return parts[parts.length - 1] || '';
}

function isSameStoreId(leftId, rightId) {
    const left = normalizeComparableEntityId(leftId);
    const right = normalizeComparableEntityId(rightId);
    if (!left || !right) {
        return false;
    }
    if (left === right) {
        return true;
    }
    return extractEntitySuffix(left) === extractEntitySuffix(right);
}

function getCurrentStoreId() {
    const listStoreId = normalizeEntityId(
        document.getElementById('store-notifications-list')?.getAttribute('data-store-id')
    );
    const rootStoreId = normalizeEntityId(
        document.getElementById('store-detail-root')?.getAttribute('data-store-id')
    );

    if (listStoreId && rootStoreId && listStoreId !== rootStoreId) {
        console.warn('Store detail ID mismatch between root and notifications list:', {
            listStoreId,
            rootStoreId
        });
    }

    return listStoreId || rootStoreId || null;
}

function hasProductInCurrentStore(productId) {
    const normalizedProductId = normalizeComparableEntityId(productId);
    if (!normalizedProductId) {
        return false;
    }

    // Prefer inventory payload rendered by store_detail template when available.
    const inventoryItems = Array.isArray(window.inventoryData?.inventory_items)
        ? window.inventoryData.inventory_items
        : [];
    if (inventoryItems.length) {
        const foundInInventoryData = inventoryItems.some((item) => {
            if (!item || typeof item !== 'object') {
                return false;
            }
            const refProduct = normalizeComparableEntityId(item?.refProduct?.value);
            if (!refProduct) {
                return false;
            }
            return refProduct === normalizedProductId || extractEntitySuffix(refProduct) === extractEntitySuffix(normalizedProductId);
        });

        if (foundInInventoryData) {
            return true;
        }
    }

    const productRows = document.querySelectorAll('.inventory-product-row[data-product-id]');
    if (!productRows.length) {
        return false;
    }

    return Array.from(productRows).some((row) => {
        const rowProductId = normalizeComparableEntityId(row.getAttribute('data-product-id'));
        if (!rowProductId) {
            return false;
        }
        return rowProductId === normalizedProductId || extractEntitySuffix(rowProductId) === extractEntitySuffix(normalizedProductId);
    });
}

function isDuplicateLowStockEvent(data) {
    const storeId = data?.store_id || data?.storeId || '-';
    const productId = data?.product_id || data?.productId || '-';
    const itemId = data?.item_id || data?.itemId;
    const shelfId = data?.shelf_id || data?.shelfId || '-';
    const dedupScope = itemId || shelfId;
    const totalStoreStock = data?.totalStoreStock ?? data?.total_store_stock ?? data?.stockCount ?? data?.stock_count;
    const cacheKey = `${storeId}|${productId}|${dedupScope}|${totalStoreStock}`;
    const now = Date.now();
    const previous = lowStockEventCache.get(cacheKey);

    for (const [key, ts] of lowStockEventCache.entries()) {
        if (now - ts > LOW_STOCK_DUP_WINDOW_MS) {
            lowStockEventCache.delete(key);
        }
    }

    if (previous && now - previous < LOW_STOCK_DUP_WINDOW_MS) {
        return true;
    }

    lowStockEventCache.set(cacheKey, now);
    return false;
}

function formatInventoryAddError(errorData, status) {
    const code = errorData?.errorCode;
    const details = errorData?.details || {};
    const fallbackError = errorData?.error || `HTTP ${status}`;

    if (code === 'SHELF_CAPACITY_EXCEEDED') {
        return interpolate(t('notifications.capacity_exceeded_message'), {
            capacity: toNumber(details.capacity, 0),
            current: toNumber(details.current, 0),
            requested: toNumber(details.requested, 0),
            maximumAllowed: toNumber(details.maximumAllowed, 0)
        });
    }

    return interpolate(t('notifications.product_add_error_message'), {
        error: fallbackError
    });
}

function formatNotificationTime(date = new Date()) {
    return date.toLocaleTimeString(currentLanguage, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function setNotificationBadgeCount(count) {
    const badge = document.getElementById('notification-count');
    if (!badge) return;

    notificationState.unreadCount = Math.max(0, Number(count) || 0);
    badge.textContent = String(notificationState.unreadCount);
    badge.classList.toggle('hidden', notificationState.unreadCount === 0);
}

function incrementNotificationBadge() {
    setNotificationBadgeCount(notificationState.unreadCount + 1);
}

function openNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    const toggle = document.getElementById('notification-toggle');
    if (!panel || !toggle) return;

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    notificationState.isPanelOpen = true;
    setNotificationBadgeCount(0);
}

function closeNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    const toggle = document.getElementById('notification-toggle');
    if (!panel || !toggle) return;

    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    notificationState.isPanelOpen = false;
}

function initializeGlobalNotificationsPanel() {
    const toggle = document.getElementById('notification-toggle');
    const closeBtn = document.getElementById('close-notifications');
    const clearBtn = document.getElementById('clear-notifications');
    const panel = document.getElementById('notifications-panel');
    const list = document.getElementById('notifications-list');

    if (!toggle || !panel) {
        return;
    }

    restoreGlobalNotifications();
    setNotificationBadgeCount(0);

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (notificationState.isPanelOpen) {
            closeNotificationsPanel();
        } else {
            openNotificationsPanel();
        }
    });

    closeBtn?.addEventListener('click', () => {
        closeNotificationsPanel();
    });

    clearBtn?.addEventListener('click', () => {
        if (!list) return;
        list.innerHTML = '';
        persistGlobalNotifications();
        setNotificationBadgeCount(0);
    });

    document.addEventListener('click', (event) => {
        if (!notificationState.isPanelOpen) {
            return;
        }

        const target = event.target;
        if (panel.contains(target) || toggle.contains(target)) {
            return;
        }

        closeNotificationsPanel();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && notificationState.isPanelOpen) {
            closeNotificationsPanel();
        }
    });

    list?.addEventListener('click', (event) => {
        const dismissBtn = event.target.closest('.notification-dismiss');
        if (!dismissBtn) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const item = dismissBtn.closest('.notification-item');
        if (!item) {
            return;
        }

        item.remove();
        persistGlobalNotifications();
    });
}

function showNotification(titleOrOptions, message, level = 'info', icon) {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    const opts = typeof titleOrOptions === 'object'
        ? titleOrOptions
        : { title: titleOrOptions, message, level, icon };

    const resolvedLevel = opts.level || 'info';
    const resolvedIcon = opts.icon || getIcon(resolvedLevel);
    const title = opts.title || '';
    const body = opts.message || '';
    const timestamp = formatNotificationTime(new Date());
    
    const item = document.createElement('div');
    item.className = `notification-item ${resolvedLevel}`;
    item.dataset.level = resolvedLevel;
    item.dataset.icon = resolvedIcon;
    item.dataset.title = title;
    item.dataset.message = body;
    item.dataset.time = timestamp;
    item.innerHTML = `
        <i class="fas fa-${escapeHtml(resolvedIcon)}" aria-hidden="true"></i>
        <div>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(body)}</p>
            <small>${escapeHtml(timestamp)}</small>
        </div>
        <button type="button" class="notification-dismiss" aria-label="${escapeHtml(t('notifications.dismiss'))}">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    list.prepend(item);
    while (list.children.length > notificationState.maxGlobalItems) {
        list.removeChild(list.lastElementChild);
    }

    persistGlobalNotifications();
    
    if (!notificationState.isPanelOpen) {
        incrementNotificationBadge();
    }
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
    let updatedCount = 0;
    document.querySelectorAll(`.product-price-cell[data-product-id="${productId}"]`).forEach((cell) => {
        const isDetailPrice = cell.classList.contains('price');
        const hasCurrency = isDetailPrice || cell.textContent.trim().startsWith('€');
        cell.textContent = hasCurrency ? `€${formatted}` : formatted;
        updatedCount += 1;
    });

    return updatedCount;
}

function appendStoreRealtimeNotification(title, message, level = 'info') {
    const list = document.getElementById('store-notifications-list');
    if (!list) return;
    const storeId = list.getAttribute('data-store-id');

    const emptyState = list.querySelector('.store-notification-empty');
    if (emptyState) {
        emptyState.remove();
    }

    const item = document.createElement('div');
    item.className = `notification-item ${level}`;
    const icon = level === 'warning' ? 'exclamation-triangle' : 'tag';
    item.innerHTML = `
        <i class="fas fa-${icon}" aria-hidden="true"></i>
        <div>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(message)}</p>
            <small>${escapeHtml(formatNotificationTime(new Date()))}</small>
        </div>
        <button type="button" class="notification-dismiss" aria-label="${escapeHtml(t('notifications.dismiss'))}">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    list.prepend(item);

    while (list.children.length > notificationState.maxLocalItems) {
        list.removeChild(list.lastElementChild);
    }

    persistLocalNotifications(storeId, list);
}

function serializeNotificationItem(item) {
    return {
        level: item.dataset.level || 'info',
        icon: item.dataset.icon || getIcon(item.dataset.level || 'info'),
        title: item.dataset.title || item.querySelector('strong')?.textContent || '',
        message: item.dataset.message || item.querySelector('p')?.textContent || '',
        time: item.dataset.time || item.querySelector('small')?.textContent || formatNotificationTime(new Date())
    };
}

function buildNotificationItem(entry) {
    const item = document.createElement('div');
    item.className = `notification-item ${entry.level || 'info'}`;
    item.dataset.level = entry.level || 'info';
    item.dataset.icon = entry.icon || getIcon(entry.level || 'info');
    item.dataset.title = entry.title || '';
    item.dataset.message = entry.message || '';
    item.dataset.time = entry.time || formatNotificationTime(new Date());

    item.innerHTML = `
        <i class="fas fa-${escapeHtml(item.dataset.icon)}" aria-hidden="true"></i>
        <div>
            <strong>${escapeHtml(item.dataset.title)}</strong>
            <p>${escapeHtml(item.dataset.message)}</p>
            <small>${escapeHtml(item.dataset.time)}</small>
        </div>
        <button type="button" class="notification-dismiss" aria-label="${escapeHtml(t('notifications.dismiss'))}">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;

    return item;
}

function persistGlobalNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('.notification-item')).map(serializeNotificationItem);
    sessionStorage.setItem(GLOBAL_NOTIF_SESSION_KEY, JSON.stringify(items.slice(0, notificationState.maxGlobalItems)));
}

function restoreGlobalNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    let stored = [];
    try {
        stored = JSON.parse(sessionStorage.getItem(GLOBAL_NOTIF_SESSION_KEY) || '[]');
    } catch (error) {
        stored = [];
    }

    if (!Array.isArray(stored) || !stored.length) {
        return;
    }

    list.innerHTML = '';
    stored.forEach((entry) => {
        list.appendChild(buildNotificationItem(entry));
    });
}

function getLocalNotificationStore() {
    try {
        const parsed = JSON.parse(sessionStorage.getItem(LOCAL_NOTIF_SESSION_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function persistLocalNotifications(storeId, list) {
    if (!storeId || !list) return;

    const payload = getLocalNotificationStore();
    payload[storeId] = Array.from(list.querySelectorAll('.notification-item'))
        .map(serializeNotificationItem)
        .slice(0, notificationState.maxLocalItems);
    sessionStorage.setItem(LOCAL_NOTIF_SESSION_KEY, JSON.stringify(payload));
}

function persistLocalNotificationEntry(storeId, entry) {
    const normalizedStoreId = normalizeEntityId(storeId);
    if (!normalizedStoreId || !entry) {
        return;
    }

    const payload = getLocalNotificationStore();
    const existingEntries = Array.isArray(payload[normalizedStoreId]) ? payload[normalizedStoreId] : [];
    payload[normalizedStoreId] = [entry, ...existingEntries].slice(0, notificationState.maxLocalItems);
    sessionStorage.setItem(LOCAL_NOTIF_SESSION_KEY, JSON.stringify(payload));
}

function initializeStoreNotificationPanel() {
    const list = document.getElementById('store-notifications-list');
    const clearBtn = document.getElementById('clear-store-notifications');
    if (!list) return;

    const storeId = list.getAttribute('data-store-id');
    if (!storeId) return;

    const payload = getLocalNotificationStore();
    const entries = payload[storeId] || [];
    const emptyState = list.querySelector('.store-notification-empty');

    if (entries.length) {
        if (emptyState) {
            emptyState.remove();
        }
        entries.forEach((entry) => {
            list.appendChild(buildNotificationItem(entry));
        });
    }

    list.addEventListener('click', (event) => {
        const dismissBtn = event.target.closest('.notification-dismiss');
        if (!dismissBtn) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const item = dismissBtn.closest('.notification-item');
        if (!item) {
            return;
        }

        item.remove();
        if (!list.querySelector('.notification-item') && !list.querySelector('.store-notification-empty')) {
            const empty = document.createElement('p');
            empty.className = 'store-notification-empty';
            empty.setAttribute('data-i18n', 'store.no_notifications');
            empty.textContent = t('store.no_notifications');
            list.appendChild(empty);
        }
        persistLocalNotifications(storeId, list);
    });

    clearBtn?.addEventListener('click', () => {
        list.innerHTML = '';
        const empty = document.createElement('p');
        empty.className = 'store-notification-empty';
        empty.setAttribute('data-i18n', 'store.no_notifications');
        empty.textContent = t('store.no_notifications');
        list.appendChild(empty);
        persistLocalNotifications(storeId, list);
    });
}

function initializeRealtimeNotifications() {
    const socket = window.appSocket || (typeof io !== 'undefined' ? io() : null);
    if (!socket || window.__realtimeHandlersReady) {
        return;
    }

    window.__realtimeHandlersReady = true;

    socket.on('price_change', (data) => {
        const productId = data?.product_id;
        const productName = data?.product_name || productId || '-';
        const newPrice = data?.new_price;
        const affectedStoreIds = Array.isArray(data?.store_ids) ? data.store_ids : [];
        const storeNotifications = document.getElementById('store-notifications-list');
        const isStoreDetailPage = Boolean(storeNotifications);
        const currentStoreId = getCurrentStoreId();
        const currentStoreHasProduct = hasProductInCurrentStore(productId);
        const title = t('notifications.price_change_title');
        const message = interpolate(t('notifications.price_change_message'), {
            product: productName,
            price: formatPriceValue(newPrice)
        });
        const localEntry = {
            level: 'info',
            icon: 'tag',
            title,
            message,
            time: formatNotificationTime(new Date())
        };

        console.log('Socket event price_change:', data);

        const updatedPriceCells = updateProductPriceUI(productId, newPrice) || 0;
        showNotification({ title, message, level: 'info', icon: 'tag' });

        const isCurrentStoreImpacted = Boolean(currentStoreId) &&
            affectedStoreIds.some((storeId) => isSameStoreId(storeId, currentStoreId));
        const eventProductIsRendered = updatedPriceCells > 0;

        const targetStoreIds = [];
        const seenStores = new Set();
        affectedStoreIds.forEach((storeId) => {
            const normalized = normalizeComparableEntityId(storeId);
            if (!normalized || seenStores.has(normalized)) {
                return;
            }
            seenStores.add(normalized);
            targetStoreIds.push(storeId);
        });

        const shouldNotifyCurrentStore = isStoreDetailPage && (isCurrentStoreImpacted || currentStoreHasProduct || eventProductIsRendered);
        if (shouldNotifyCurrentStore && currentStoreId) {
            const currentNormalized = normalizeComparableEntityId(currentStoreId);
            if (currentNormalized && !seenStores.has(currentNormalized)) {
                seenStores.add(currentNormalized);
                targetStoreIds.push(currentStoreId);
            }
        }

        targetStoreIds.forEach((storeId) => {
            if (isStoreDetailPage && currentStoreId && isSameStoreId(storeId, currentStoreId)) {
                appendStoreRealtimeNotification(title, message, 'info');
                return;
            }
            persistLocalNotificationEntry(storeId, localEntry);
        });

        if (shouldNotifyCurrentStore && !targetStoreIds.length) {
            appendStoreRealtimeNotification(title, message, 'info');
        }
    });

    socket.on('low_stock', (data) => {
        if (isDuplicateLowStockEvent(data)) {
            console.log('Skipping duplicated low_stock event:', data);
            return;
        }

        const currentStoreId = getCurrentStoreId();
        const eventStoreId = data?.store_id || data?.storeId;
        const shelfCount = toNumber(data?.shelfCount ?? data?.shelf_count ?? 0, 0);
        const totalStoreStock = toNumber(
            data?.totalStoreStock ?? data?.total_store_stock ?? data?.stockCount ?? data?.stock_count ?? 0,
            0
        );
        const productName = data?.product_name || data?.product_id || '-';
        const storeName = data?.store_name || data?.store_id || '-';
        const shelfName = data?.shelf_name || data?.shelf_id || '-';
        const title = t('notifications.low_stock_title');
        const remainingCount = totalStoreStock;
        const globalMessage = interpolate(t('notifications.low_stock_message'), {
            count: remainingCount,
            product: productName,
            store: storeName,
            shelf: shelfName,
            total: totalStoreStock
        });

        console.log('Socket event low_stock:', data);

        showNotification({ title, message: globalMessage, level: 'warning', icon: 'exclamation-triangle' });

        if (currentStoreId && isSameStoreId(currentStoreId, eventStoreId)) {
            const localMessage = interpolate(t('notifications.local_low_stock_message'), {
                product: productName,
                count: remainingCount,
                shelf: shelfName,
                total: totalStoreStock
            });
            appendStoreRealtimeNotification(
                title,
                localMessage,
                'warning'
            );
        }
    });
}

// ============================================================================
// Mermaid initialization
// ============================================================================

function getMermaidTheme() {
    return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
}

function getMermaidConfig() {
    return {
        startOnLoad: false,
        theme: getMermaidTheme() === 'dark' ? 'dark' : 'default'
    };
}

async function renderMermaidDiagrams() {
    if (typeof mermaid === 'undefined') {
        return;
    }

    const diagrams = Array.from(document.querySelectorAll('.mermaid'));
    if (!diagrams.length) {
        return;
    }

    mermaid.initialize(getMermaidConfig());

    for (let index = 0; index < diagrams.length; index += 1) {
        const diagram = diagrams[index];
        if (!diagram.dataset.mermaidSource) {
            diagram.dataset.mermaidSource = diagram.textContent.trim();
        }

        const source = diagram.dataset.mermaidSource;
        const renderId = `mermaid-${index}-${Date.now()}`;

        try {
            const renderResult = await mermaid.render(renderId, source);
            diagram.innerHTML = renderResult.svg;
            if (typeof renderResult.bindFunctions === 'function') {
                renderResult.bindFunctions(diagram);
            }
        } catch (error) {
            console.error('Mermaid render error:', error);
            diagram.textContent = source;
        }
    }
}

document.addEventListener('DOMContentLoaded', renderMermaidDiagrams);
document.addEventListener('app:theme-changed', renderMermaidDiagrams);

// ============================================================================
// Inventory Item "Buy" Button Functionality
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Attach click handlers to all buy buttons
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();

            if (
                button.getAttribute('aria-disabled') === 'true' ||
                button.classList.contains('disabled') ||
                button.dataset.buyPending === 'true'
            ) {
                return;
            }
            
            const inventoryItemId = button.getAttribute('data-inventoryitem-id');
            const shelfCount = parseInt(button.getAttribute('data-shelf-count')) || 0;
            const stockCount = parseInt(button.getAttribute('data-stock-count')) || 0;
            
            // Validate shelf count
            if (shelfCount <= 0) {
                button.classList.add('disabled');
                button.setAttribute('aria-disabled', 'true');
                showNotification(t('notifications.no_stock_title'), t('notifications.no_stock_message'), 'warning');
                return;
            }

            button.dataset.buyPending = 'true';
            const shouldDisableNow = shelfCount === 1;
            if (shouldDisableNow) {
                // Instant UI feedback when the last unit is bought.
                updateInventoryItemUI(
                    inventoryItemId,
                    0,
                    Math.max(0, stockCount - 1)
                );
            }

            try {
                // Make PATCH request to Orion
                const result = await buyInventoryItem(inventoryItemId, shelfCount, stockCount);
                if (result.outOfStock) {
                    // Safety net: keep clicked button disabled even if table lookup fails.
                    button.classList.add('disabled');
                    button.setAttribute('aria-disabled', 'true');
                    button.setAttribute('data-shelf-count', '0');
                }
                if (!result.success && shouldDisableNow && !result.outOfStock) {
                    updateInventoryItemUI(inventoryItemId, shelfCount, stockCount);
                }
            } finally {
                button.dataset.buyPending = 'false';
            }
        });
    });

    initializeInventoryQuantityEditors();
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
            const payload = await response.json();
            const resolvedShelfCount = payload?.newShelfCount ?? newShelfCount;
            const resolvedStockCount = payload?.newStockCount ?? newStockCount;
            console.log(`[BUY] Success for ${inventoryItemId}`);
            updateInventoryItemUI(inventoryItemId, resolvedShelfCount, resolvedStockCount);
            showNotification(t('notifications.purchase_success_title'), t('notifications.purchase_success_message'), 'success');
            return { success: true, outOfStock: false };
        } else {
            const errorPayload = await response.json().catch(() => ({}));
            const errorMessage = errorPayload?.error || `HTTP ${response.status}`;
            const normalizedErrorMessage = String(errorMessage).toLowerCase();
            const isOutOfStock = (
                response.status === 400 &&
                (
                    normalizedErrorMessage.includes('no stock available on this shelf') ||
                    normalizedErrorMessage.includes('no stock available for this inventory item') ||
                    normalizedErrorMessage.includes('no stock available')
                )
            );

            if (isOutOfStock) {
                updateInventoryItemUI(inventoryItemId, 0, Math.max(0, currentStockCount));
                showNotification(t('notifications.no_stock_title'), t('notifications.no_stock_message'), 'warning');
                return { success: false, outOfStock: true };
            }

            console.error(`[BUY] PATCH failed with status ${response.status}: ${errorMessage}`);
            showNotification(
                t('notifications.error_title'),
                interpolate(t('notifications.update_stock_error_message'), { error: errorMessage }),
                'error'
            );
            return { success: false, outOfStock: false };
        }
    } catch (error) {
        console.error('[BUY] Error:', error);
        showNotification(
            t('notifications.connection_error_title'),
            interpolate(t('notifications.connect_orion_error_message'), { error: error.message }),
            'error'
        );
        return { success: false, outOfStock: false };
    }
}

function initializeInventoryQuantityEditors() {
    const rows = document.querySelectorAll('.inventory-product-row[data-inventoryitem-id]');
    if (!rows.length) {
        return;
    }

    rows.forEach((row) => {
        const inventoryItemId = row.getAttribute('data-inventoryitem-id');
        const shelfCell = row.querySelector('.inventory-shelf-cell');
        const form = row.querySelector('.inline-quantity-form');
        const input = row.querySelector('.inline-quantity-input');
        const editButton = row.querySelector('.btn-edit-quantity');
        const cancelButton = row.querySelector('.btn-cancel-quantity');

        if (!inventoryItemId || !shelfCell || !form || !input || !editButton || !cancelButton) {
            return;
        }

        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            const currentValue = parseInt(shelfCell.getAttribute('data-current-shelf-count') || '0', 10);
            input.value = String(Number.isNaN(currentValue) ? 0 : Math.max(0, currentValue));
            setQuantityEditMode(shelfCell, true);
            input.focus();
            input.select();
        });

        cancelButton.addEventListener('click', () => {
            const currentValue = parseInt(shelfCell.getAttribute('data-current-shelf-count') || '0', 10);
            input.value = String(Number.isNaN(currentValue) ? 0 : Math.max(0, currentValue));
            setQuantityEditMode(shelfCell, false);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (form.dataset.pending === 'true') {
                return;
            }

            const parsedValue = parseInt(input.value, 10);
            if (Number.isNaN(parsedValue) || parsedValue < 0) {
                showNotification(t('notifications.error_title'), 'La cantidad debe ser un numero mayor o igual a 0', 'error');
                return;
            }

            form.dataset.pending = 'true';

            try {
                const result = await updateInventoryItemQuantity(inventoryItemId, parsedValue);
                if (result.success) {
                    updateInventoryItemUI(inventoryItemId, result.newShelfCount, result.newStockCount);
                    setQuantityEditMode(shelfCell, false);
                    showNotification(t('notifications.purchase_success_title'), 'Cantidad actualizada correctamente', 'success');
                } else {
                    showNotification(
                        t('notifications.error_title'),
                        result.error || 'No se pudo actualizar la cantidad',
                        'error'
                    );
                }
            } finally {
                form.dataset.pending = 'false';
            }
        });
    });
}

function setQuantityEditMode(shelfCell, isEditing) {
    if (!shelfCell) {
        return;
    }
    shelfCell.classList.toggle('is-editing', !!isEditing);
}

async function updateInventoryItemQuantity(inventoryItemId, newShelfCount) {
    try {
        const response = await fetch(`/api/inventory-items/${encodeURIComponent(inventoryItemId)}/quantity`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newShelfCount })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                error: payload?.error || `HTTP ${response.status}`
            };
        }

        return {
            success: true,
            newShelfCount: payload?.newShelfCount ?? newShelfCount,
            newStockCount: payload?.newStockCount ?? 0
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
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
    const shelfAbsoluteCapacity = 32;

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
            const maxCapacity = parseInt(formData.get('maxCapacity'), 10);
            if (Number.isNaN(maxCapacity) || maxCapacity <= 0) {
                showNotification(t('notifications.error_title'), t('notifications.validation_positive_counts'), 'error');
                return;
            }
            if (maxCapacity > shelfAbsoluteCapacity) {
                showNotification(
                    t('notifications.error_title'),
                    interpolate(t('notifications.shelf_absolute_limit_message'), { limit: shelfAbsoluteCapacity }),
                    'error'
                );
                return;
            }

            const payload = {
                name: formData.get('name'),
                maxCapacity
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

                showNotification(t('notifications.shelf_created_title'), t('notifications.shelf_created_message'), 'success');
                closeModal('add-shelf-modal');
                window.location.reload();
            } catch (error) {
                showNotification(
                    t('notifications.error_title'),
                    interpolate(t('notifications.shelf_create_error_message'), { error: error.message }),
                    'error'
                );
            }
        });
    }

    const editShelfForm = document.getElementById('edit-shelf-form');
    if (editShelfForm) {
        editShelfForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editShelfForm);
            const shelfId = formData.get('shelfId');
            const maxCapacity = parseInt(formData.get('maxCapacity'), 10);
            if (Number.isNaN(maxCapacity) || maxCapacity <= 0) {
                showNotification(t('notifications.error_title'), t('notifications.validation_positive_counts'), 'error');
                return;
            }
            if (maxCapacity > shelfAbsoluteCapacity) {
                showNotification(
                    t('notifications.error_title'),
                    interpolate(t('notifications.shelf_absolute_limit_message'), { limit: shelfAbsoluteCapacity }),
                    'error'
                );
                return;
            }

            const payload = {
                name: formData.get('name'),
                maxCapacity
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

                showNotification(t('notifications.shelf_updated_title'), t('notifications.shelf_updated_message'), 'success');
                closeModal('edit-shelf-modal');
                window.location.reload();
            } catch (error) {
                showNotification(
                    t('notifications.error_title'),
                    interpolate(t('notifications.shelf_update_error_message'), { error: error.message }),
                    'error'
                );
            }
        });
    }

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addProductForm);
            const shelfId = formData.get('shelfId');
            const maxAllowed = parseInt(addProductForm.getAttribute('data-max-allowed') || '', 10);
            const shelfCount = parseInt(formData.get('shelfCount'), 10);

            if (Number.isNaN(shelfCount) || shelfCount <= 0) {
                showNotification(t('notifications.error_title'), t('notifications.validation_positive_counts'), 'error');
                return;
            }

            if (!Number.isNaN(maxAllowed) && maxAllowed >= 0 && shelfCount > maxAllowed) {
                showNotification(
                    t('notifications.error_title'),
                    interpolate(t('notifications.shelf_remaining_capacity_message'), { maximumAllowed: maxAllowed }),
                    'error'
                );
                return;
            }

            const payload = {
                productId: formData.get('productId'),
                shelfCount
            };

            try {
                const response = await fetch(`/api/shelves/${encodeURIComponent(shelfId)}/inventory-items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    showNotification(
                        t('notifications.error_title'),
                        formatInventoryAddError(errorData, response.status),
                        'error'
                    );
                    return;
                }

                showNotification(t('notifications.product_added_title'), t('notifications.product_added_message'), 'success');
                closeModal('add-product-modal');
                window.location.reload();
            } catch (error) {
                showNotification(
                    t('notifications.error_title'),
                    interpolate(t('notifications.product_add_error_message'), { error: error.message }),
                    'error'
                );
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
            showNotification(t('notifications.error_title'), t('notifications.validation_positive_counts'), 'error');
            return;
        }

        if (shelfCount > stockCount) {
            showNotification(t('notifications.error_title'), t('notifications.validation_shelf_gt_stock'), 'error');
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
                showNotification(
                    t('notifications.error_title'),
                    formatInventoryAddError(data, response.status),
                    'error'
                );
                return;
            }

            showNotification(t('notifications.inventory_created_title'), t('notifications.inventory_created_message'), 'success');
            closeModal('add-inventory-modal');
            window.location.reload();
        } catch (error) {
            showNotification(
                t('notifications.error_title'),
                interpolate(t('notifications.inventory_create_error_message'), { error: error.message }),
                'error'
            );
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
        showNotification(
            t('notifications.error_title'),
            interpolate(t('notifications.load_shelves_error_message'), { error: error.message }),
            'error'
        );
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
    const currentUnits = parseInt(button.getAttribute('data-shelf-current') || '0', 10);
    shelfCapacityField.value = button.getAttribute('data-shelf-capacity') || 1;
    shelfCapacityField.min = String(Number.isNaN(currentUnits) ? 1 : Math.max(1, currentUnits));
    shelfCapacityField.max = '32';
}

async function prepareAddProductForm(button) {
    const shelfId = button.getAttribute('data-shelf-id') || '';
    const shelfCapacity = parseInt(button.getAttribute('data-shelf-capacity') || '0', 10);
    const shelfCurrent = parseInt(button.getAttribute('data-shelf-current') || '0', 10);
    const select = document.getElementById('add-product-select');
    const shelfIdField = document.getElementById('add-product-shelf-id');
    const shelfCountField = document.getElementById('add-product-shelf-count');
    const addProductForm = document.getElementById('add-product-form');
    const submitButton = addProductForm?.querySelector('button[type="submit"]');

    if (!select || !shelfIdField || !shelfCountField || !addProductForm) {
        return;
    }

    shelfIdField.value = shelfId;
    select.innerHTML = `<option value="">${t('store.select_product')}</option>`;

    const hasCapacityContext = !Number.isNaN(shelfCapacity) && shelfCapacity > 0 && !Number.isNaN(shelfCurrent) && shelfCurrent >= 0;
    let maxAllowed = null;

    if (hasCapacityContext) {
        const effectiveCapacity = Math.min(shelfCapacity, 32);
        maxAllowed = Math.max(0, effectiveCapacity - shelfCurrent);
        shelfCountField.max = String(Math.max(1, maxAllowed));
        shelfCountField.value = String(Math.max(1, Math.min(parseInt(shelfCountField.value || '1', 10) || 1, Math.max(1, maxAllowed))));
        addProductForm.setAttribute('data-max-allowed', String(maxAllowed));
        if (submitButton) {
            submitButton.disabled = maxAllowed <= 0;
        }
    } else {
        // Keep flow usable if template metadata is unavailable; backend still enforces capacity.
        addProductForm.removeAttribute('data-max-allowed');
        shelfCountField.max = '32';
        shelfCountField.value = String(Math.max(1, parseInt(shelfCountField.value || '1', 10) || 1));
        if (submitButton) {
            submitButton.disabled = false;
        }
    }

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
            if (submitButton) {
                submitButton.disabled = true;
            }
            return;
        }

        if (maxAllowed !== null && maxAllowed <= 0) {
            showNotification(
                t('notifications.error_title'),
                interpolate(t('notifications.shelf_remaining_capacity_message'), { maximumAllowed: 0 }),
                'error'
            );
        }

        availableProducts.forEach((product) => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name?.value || product.id;
            select.appendChild(option);
        });
    } catch (error) {
        showNotification(
            t('notifications.error_title'),
            interpolate(t('notifications.load_products_error_message'), { error: error.message }),
            'error'
        );
    }
}

/**
 * Update UI to reflect new inventory counts without page reload
 */
function updateInventoryItemUI(inventoryItemId, newShelfCount, newStockCount) {
    // Find the buy button element (the row also has this data attribute).
    const button = document.querySelector(`.btn-buy[data-inventoryitem-id="${inventoryItemId}"]`);
    if (!button) {
        console.warn(`[UPDATE] Button not found for ${inventoryItemId}`);
        return;
    }
    
    const tr = button.closest('tr');
    if (!tr) {
        console.warn(`[UPDATE] Table row not found for ${inventoryItemId}`);
        return;
    }
    
    const productId = tr.getAttribute('data-product-id');

    const stockCell = tr.querySelector('.inventory-stock-cell') || tr.querySelector('td:nth-child(6)');
    if (stockCell) {
        stockCell.textContent = Math.max(0, newStockCount);
    }
    
    // Update the Shelf Quantity column (7th column, index 6)
    const shelfCell = tr.querySelector('.inventory-shelf-cell') || tr.querySelector('td:nth-child(7)');
    if (shelfCell) {
        const display = shelfCell.querySelector('.shelf-count-display');
        const input = shelfCell.querySelector('.inline-quantity-input');
        const safeShelfCount = Math.max(0, newShelfCount);
        if (display) {
            display.textContent = safeShelfCount;
        } else {
            shelfCell.textContent = safeShelfCount;
        }
        if (input) {
            input.value = String(safeShelfCount);
        }
        shelfCell.setAttribute('data-current-shelf-count', String(safeShelfCount));
        shelfCell.classList.remove('is-editing');
    }

    if (productId) {
        const rowsForProduct = document.querySelectorAll(`.inventory-product-row[data-product-id="${productId}"]`);
        const aggregatedStock = Array.from(rowsForProduct).reduce((acc, row) => {
            const rowShelf = row.querySelector('.inventory-shelf-cell');
            const shelfDisplay = rowShelf?.querySelector('.shelf-count-display');
            const shelfValue = parseInt((shelfDisplay?.textContent || rowShelf?.textContent || '0'), 10);
            return acc + (Number.isFinite(shelfValue) ? Math.max(0, shelfValue) : 0);
        }, 0);

        rowsForProduct.forEach((row) => {
            const rowStockCell = row.querySelector('.inventory-stock-cell');
            const rowBuyButton = row.querySelector('.btn-buy');
            if (rowStockCell) {
                rowStockCell.textContent = aggregatedStock;
            }
            if (rowBuyButton) {
                rowBuyButton.setAttribute('data-stock-count', String(Math.max(0, aggregatedStock)));
            }
        });
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

            const row = btn.closest('tr');
            const rowName = row?.querySelector('.name-cell a, .name-cell')?.textContent?.trim();
            const fallbackName = entityId.split(':').pop();
            const entityName = rowName || fallbackName;
            
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
                            const deletedMessage = entityName
                                ? interpolate(t('notifications.deleted_message_named'), { name: entityName })
                                : t('notifications.deleted_message');
                            showNotification(t('notifications.deleted_title'), deletedMessage, 'success');
                            setTimeout(() => window.location.reload(), 250);
                        } else {
                            showNotification(t('notifications.error_title'), t('notifications.delete_error_message'), 'error');
                        }
                    })
                    .catch(err => {
                        console.error('Delete error:', err);
                        showNotification(
                            t('notifications.connection_error_title'),
                            t('notifications.server_connection_error_message'),
                            'error'
                        );
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

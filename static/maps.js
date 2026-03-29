/**
 * maps.js - Leaflet.js map initialization and management
 * Handles individual store maps and global store map view
 */

function mapT(key, fallback) {
    if (typeof window.t === 'function') {
        const value = window.t(key);
        if (value && value !== key) {
            return value;
        }
    }
    return fallback;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toStoreSlug(storeId) {
    if (!storeId || typeof storeId !== 'string') {
        return '';
    }
    const parts = storeId.split(':');
    return parts[parts.length - 1] || '';
}

function toClimateValue(rawValue, suffix = '') {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return mapT('common.not_available', 'N/A');
    }
    return `${rawValue}${suffix}`;
}

function buildMarkerImageIcon(storeImage) {
    const imgSrc = escapeHtml(storeImage || 'https://via.placeholder.com/54x54');
    return L.divIcon({
        className: 'store-image-marker-wrapper',
        html: `<div class="store-image-marker"><img src="${imgSrc}" alt="Store"></div>`,
        iconSize: [54, 54],
        iconAnchor: [27, 27],
        popupAnchor: [0, -24]
    });
}

function buildStoreHoverCard(store) {
    const storeName = store.name?.value || mapT('map.unknown_store', 'Unknown store');
    const locality = store.address?.value?.addressLocality || mapT('map.unknown_locality', 'Localidad desconocida');
    const capacityRaw = store.capacity?.value;
    const capacity = (capacityRaw === undefined || capacityRaw === null || capacityRaw === '')
        ? mapT('common.not_available', 'N/A')
        : `${capacityRaw} m³`;
    const phone = store.telephone?.value || mapT('common.not_available', 'N/A');
    const image = store.image?.value || 'https://via.placeholder.com/260x140';

    return `
        <div class="store-hover-card">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(storeName)}" class="store-hover-card-image">
            <div class="store-hover-card-body">
                <h4 class="store-hover-card-title">${escapeHtml(storeName)}</h4>
                <p>${escapeHtml(locality)}</p>
                <p><strong>${escapeHtml(mapT('map.capacity_label', 'Capacidad'))}:</strong> ${escapeHtml(capacity)}</p>
                <p>${escapeHtml(phone)}</p>
            </div>
        </div>
    `;
}

function initializeStoreMap(config) {
    const container = document.getElementById('map-container');
    if (!container || typeof L === 'undefined') return;
    
    // Reverse coordinates from GeoJSON [lon, lat] to [lat, lon] for Leaflet
    const center = [config.center[1], config.center[0]];
    
    const map = L.map(container).setView(center, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add marker for store
    L.marker(center, {
        title: config.storeName
    }).bindPopup(`
        <div style="width: 200px;">
            <img src="${config.storeImage}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;">
            <h4>${config.storeName}</h4>
        </div>
    `).addTo(map);
}

function initializeGlobalMap(stores) {
    const container = document.getElementById('global-map');
    if (!container || typeof L === 'undefined') return;
    
    // Calculate center point
    let centerLat = 0, centerLon = 0;
    stores.forEach(store => {
        if (store.location?.value?.coordinates) {
            centerLon += store.location.value.coordinates[0];
            centerLat += store.location.value.coordinates[1];
        }
    });
    
    centerLat /= stores.length || 1;
    centerLon /= stores.length || 1;
    
    const map = L.map(container).setView([centerLat, centerLon], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add markers for all stores
    stores.forEach(store => {
        if (store.location?.value?.coordinates) {
            const coords = [store.location.value.coordinates[1], store.location.value.coordinates[0]];
            const storeSlug = toStoreSlug(store.id);
            const marker = L.marker(coords, {
                title: store.name?.value || mapT('map.unknown_store', 'Unknown store'),
                icon: buildMarkerImageIcon(store.image?.value)
            }).addTo(map);

            marker.bindTooltip(buildStoreHoverCard(store), {
                direction: 'top',
                sticky: true,
                opacity: 1,
                className: 'store-hover-tooltip',
                offset: [0, -12]
            });

            marker.on('click', () => {
                if (storeSlug) {
                    window.location.href = `/stores/${encodeURIComponent(storeSlug)}`;
                }
            });
        }
    });
}

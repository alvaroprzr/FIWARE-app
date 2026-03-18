/**
 * maps.js - Leaflet.js map initialization and management
 * Handles individual store maps and global store map view
 */

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
            
            L.marker(coords, {
                title: store.name?.value || 'Store'
            }).bindPopup(`
                <div style="width: 250px;">
                    <img src="${store.image?.value}" style="width: 100%; border-radius: 8px; margin-bottom: 8px; max-height: 150px; object-fit: cover;">
                    <h4><a href="/stores/${store.id.split(':').pop()}">${store.name?.value}</a></h4>
                    <p><strong>${store.address?.value?.addressLocality || 'Unknown'}</strong></p>
                    <p>Capacidad: ${store.capacity?.value} m²</p>
                    <p><i class="fas fa-phone"></i> ${store.telephone?.value}</p>
                </div>
            `).addTo(map);
        }
    });
}

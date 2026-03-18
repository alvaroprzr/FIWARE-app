/**
 * store_3d.js - Three.js 3D visualization of store shelves
 * Displays store layout with shelves as 3D boxes
 */

let scene, camera, renderer;

function initializeStoreScene(config) {
    const container = document.getElementById('three-container');
    if (!container || typeof THREE === 'undefined') return;
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Create shelves
    const shelves = config.shelves || [];
    const shelfSpacing = 6;
    const shelfCount = shelves.length;
    const startX = -(shelfCount - 1) * shelfSpacing / 2;
    
    shelves.forEach((shelf, index) => {
        const shelfGeometry = new THREE.BoxGeometry(4, 3, 2);
        const shelfMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x1f73db
        });
        const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
        
        shelfMesh.position.set(startX + index * shelfSpacing, 1.5, 0);
        shelfMesh.castShadow = true;
        shelfMesh.receiveShadow = true;
        
        scene.add(shelfMesh);
        
        // Add label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(shelf.name?.value || `Shelf ${index + 1}`, 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const labelGeometry = new THREE.PlaneGeometry(4, 2);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(shelfMesh.position.x, shelfMesh.position.y + 2, shelfMesh.position.z + 1.1);
        scene.add(label);
    });
    
    // Mouse controls (orbit)
    setupCameraControls();
    
    // Animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function setupCameraControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    document.getElementById('three-container')?.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        // Rotate camera around scene
        const radius = camera.position.length();
        const theta = Math.atan2(camera.position.z, camera.position.x) + deltaX * 0.01;
        const phi = Math.acos(camera.position.y / radius) + deltaY * 0.01;
        
        camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(0, 2, 0);
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('three-container');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

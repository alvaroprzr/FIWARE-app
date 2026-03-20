/**
 * store_3d.js - Immersive Three.js virtual tour for store detail.
 * Renders shelves as 3D boxes and projects HTML overlays with shelf inventory.
 */

let store3DState = null;

const TOUR_TEXT = {
  es: {
    shelfFallback: 'Shelf',
    shelfCount: 'shelfCount',
    stockCount: 'stockCount',
    empty: 'Sin productos'
  },
  en: {
    shelfFallback: 'Shelf',
    shelfCount: 'shelfCount',
    stockCount: 'stockCount',
    empty: 'No products'
  }
};

function initializeStoreScene(config) {
  cleanupStoreScene();

  const container = document.getElementById('three-container');
  const overlayContainer = document.getElementById('three-overlay');

  if (!container || !overlayContainer || typeof THREE === 'undefined') {
    return;
  }

  const shelves = Array.isArray(config?.shelves) ? config.shelves : [];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(getSceneBackgroundColor());

  const camera = new THREE.PerspectiveCamera(
    60,
    Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
    0.1,
    1500
  );
  camera.position.set(16, 13, 16);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = createOrbitControls(camera, renderer.domElement, shelves.length);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(12, 22, 14);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const floorGeometry = new THREE.PlaneGeometry(120, 120);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xced4da,
    roughness: 0.9,
    metalness: 0.08
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  store3DState = {
    scene,
    camera,
    renderer,
    controls,
    container,
    overlayContainer,
    inventoryByShelf: config?.inventoryByShelf || {},
    productsById: config?.productsById || {},
    shelfMeshes: [],
    overlayByShelfId: new Map(),
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    hoveredShelf: null,
    animationFrameId: null,
    handlers: {}
  };

  createShelfMeshes(shelves);
  bind3DEvents();
  animateStoreScene();
}

function createOrbitControls(camera, domElement, shelfCount) {
  if (!THREE.OrbitControls) {
    return null;
  }

  const controls = new THREE.OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.minDistance = 6;
  controls.maxDistance = Math.max(20, 10 + shelfCount * 3.5);
  controls.target.set(0, 1.4, 0);
  controls.update();
  return controls;
}

function createShelfMeshes(shelves) {
  if (!store3DState) {
    return;
  }

  const layout = buildShelfLayout(shelves.length);

  shelves.forEach((shelf, index) => {
    const position = layout[index];
    const shelfId = shelf?.id;
    const shelfName = shelf?.name?.value || `${getTourText('shelfFallback')} ${index + 1}`;
    const shelfItems = store3DState.inventoryByShelf[shelfId] || [];
    const productRows = buildShelfRows(shelfItems, store3DState.productsById);

    const geometry = new THREE.BoxGeometry(3.2, 2.4, 1.6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1f73db,
      roughness: 0.45,
      metalness: 0.12,
      emissive: 0x000000
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, 1.2, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { shelfId };

    store3DState.scene.add(mesh);
    store3DState.shelfMeshes.push(mesh);

    const overlayEntry = {
      shelfId,
      shelfName,
      rows: productRows,
      element: createOverlayCard(shelfName, productRows)
    };

    store3DState.overlayContainer.appendChild(overlayEntry.element);
    store3DState.overlayByShelfId.set(shelfId, overlayEntry);
  });
}

function buildShelfLayout(totalShelves) {
  if (totalShelves <= 0) {
    return [];
  }

  const columns = Math.ceil(Math.sqrt(totalShelves));
  const rows = Math.ceil(totalShelves / columns);
  const spacingX = 6;
  const spacingZ = 6;
  const offsetX = ((columns - 1) * spacingX) / 2;
  const offsetZ = ((rows - 1) * spacingZ) / 2;

  const points = [];
  for (let idx = 0; idx < totalShelves; idx += 1) {
    const row = Math.floor(idx / columns);
    const col = idx % columns;
    points.push({
      x: col * spacingX - offsetX,
      z: row * spacingZ - offsetZ
    });
  }

  return points;
}

function buildShelfRows(shelfItems, productsById) {
  return shelfItems.map((item, index) => {
    const productId = item?.refProduct?.value || '';
    const product = productsById[productId] || null;
    const fallbackName = productId ? productId.split(':').pop() : `Product ${index + 1}`;

    return {
      name: product?.name?.value || fallbackName,
      shelfCount: getCountValue(item?.shelfCount),
      stockCount: getCountValue(item?.stockCount)
    };
  });
}

function getCountValue(attribute) {
  const raw = attribute && typeof attribute === 'object' ? attribute.value : attribute;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : 0;
}

function createOverlayCard(shelfName, rows) {
  const card = document.createElement('div');
  card.className = 'shelf-overlay-card';

  const title = document.createElement('h4');
  title.className = 'shelf-overlay-title';
  title.textContent = shelfName;
  card.appendChild(title);

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'shelf-overlay-empty';
    empty.textContent = getTourText('empty');
    card.appendChild(empty);
    return card;
  }

  const list = document.createElement('ul');
  list.className = 'shelf-overlay-list';

  rows.forEach((row) => {
    const item = document.createElement('li');
    item.className = 'shelf-overlay-item';

    const name = document.createElement('span');
    name.className = 'label';
    name.textContent = row.name;

    const shelf = document.createElement('span');
    shelf.textContent = `${getTourText('shelfCount')}: ${row.shelfCount}`;

    const stock = document.createElement('span');
    stock.textContent = `${getTourText('stockCount')}: ${row.stockCount}`;

    item.appendChild(name);
    item.appendChild(shelf);
    item.appendChild(stock);
    list.appendChild(item);
  });

  card.appendChild(list);
  return card;
}

function bind3DEvents() {
  if (!store3DState) {
    return;
  }

  const onMouseMove = (event) => {
    if (!store3DState) {
      return;
    }

    const rect = store3DState.container.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    store3DState.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    store3DState.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    updateHoveredShelf();
  };

  const onMouseLeave = () => {
    setHoveredShelf(null);
  };

  const onResize = () => {
    onStoreSceneResize();
  };

  const onLanguageChanged = () => {
    refreshOverlayText();
  };

  const onThemeChanged = () => {
    updateSceneTheme();
  };

  store3DState.container.addEventListener('mousemove', onMouseMove);
  store3DState.container.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', onResize);
  document.addEventListener('app:language-changed', onLanguageChanged);
  document.addEventListener('app:theme-changed', onThemeChanged);

  store3DState.handlers = {
    onMouseMove,
    onMouseLeave,
    onResize,
    onLanguageChanged,
    onThemeChanged
  };
}

function updateHoveredShelf() {
  if (!store3DState) {
    return;
  }

  store3DState.raycaster.setFromCamera(store3DState.mouse, store3DState.camera);
  const intersections = store3DState.raycaster.intersectObjects(store3DState.shelfMeshes, false);
  const next = intersections.length ? intersections[0].object : null;

  setHoveredShelf(next);
}

function setHoveredShelf(mesh) {
  if (!store3DState || store3DState.hoveredShelf === mesh) {
    return;
  }

  const prev = store3DState.hoveredShelf;
  if (prev && prev.material) {
    prev.material.emissive.setHex(0x000000);
    const prevOverlay = store3DState.overlayByShelfId.get(prev.userData?.shelfId);
    if (prevOverlay?.element) {
      prevOverlay.element.classList.remove('is-hovered');
    }
  }

  store3DState.hoveredShelf = mesh;

  if (mesh && mesh.material) {
    mesh.material.emissive.setHex(0x0f4f9f);
    const activeOverlay = store3DState.overlayByShelfId.get(mesh.userData?.shelfId);
    if (activeOverlay?.element) {
      activeOverlay.element.classList.add('is-hovered');
    }
  }
}

function refreshOverlayText() {
  if (!store3DState) {
    return;
  }

  store3DState.overlayByShelfId.forEach((entry) => {
    entry.element.replaceChildren();

    const title = document.createElement('h4');
    title.className = 'shelf-overlay-title';
    title.textContent = entry.shelfName;
    entry.element.appendChild(title);

    if (!entry.rows.length) {
      const empty = document.createElement('p');
      empty.className = 'shelf-overlay-empty';
      empty.textContent = getTourText('empty');
      entry.element.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'shelf-overlay-list';

    entry.rows.forEach((row) => {
      const item = document.createElement('li');
      item.className = 'shelf-overlay-item';

      const name = document.createElement('span');
      name.className = 'label';
      name.textContent = row.name;

      const shelf = document.createElement('span');
      shelf.textContent = `${getTourText('shelfCount')}: ${row.shelfCount}`;

      const stock = document.createElement('span');
      stock.textContent = `${getTourText('stockCount')}: ${row.stockCount}`;

      item.appendChild(name);
      item.appendChild(shelf);
      item.appendChild(stock);
      list.appendChild(item);
    });

    entry.element.appendChild(list);
  });
}

function updateSceneTheme() {
  if (!store3DState) {
    return;
  }

  store3DState.scene.background = new THREE.Color(getSceneBackgroundColor());
}

function animateStoreScene() {
  if (!store3DState) {
    return;
  }

  if (store3DState.controls) {
    store3DState.controls.update();
  }

  updateOverlayPositions();
  store3DState.renderer.render(store3DState.scene, store3DState.camera);
  store3DState.animationFrameId = requestAnimationFrame(animateStoreScene);
}

function updateOverlayPositions() {
  if (!store3DState) {
    return;
  }

  const width = store3DState.container.clientWidth;
  const height = store3DState.container.clientHeight;

  store3DState.shelfMeshes.forEach((mesh) => {
    const shelfId = mesh.userData?.shelfId;
    const entry = store3DState.overlayByShelfId.get(shelfId);
    if (!entry || !entry.element) {
      return;
    }

    const worldPosition = mesh.position.clone();
    worldPosition.y += 2.1;

    const projected = worldPosition.clone().project(store3DState.camera);
    const isVisible =
      projected.z > -1 &&
      projected.z < 1 &&
      projected.x > -1.2 &&
      projected.x < 1.2 &&
      projected.y > -1.2 &&
      projected.y < 1.2;

    if (!isVisible) {
      entry.element.style.display = 'none';
      return;
    }

    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (projected.y * -0.5 + 0.5) * height;

    entry.element.style.display = 'block';
    entry.element.style.left = `${x}px`;
    entry.element.style.top = `${y}px`;
  });
}

function onStoreSceneResize() {
  if (!store3DState) {
    return;
  }

  const width = Math.max(store3DState.container.clientWidth, 1);
  const height = Math.max(store3DState.container.clientHeight, 1);

  store3DState.camera.aspect = width / height;
  store3DState.camera.updateProjectionMatrix();
  store3DState.renderer.setSize(width, height);
}

function getSceneBackgroundColor() {
  const isDark = document.body.classList.contains('dark-theme');
  return isDark ? 0x1c1f24 : 0xf2f4f8;
}

function getTourText(key) {
  const langCode = (document.documentElement.lang || 'es').toLowerCase().startsWith('en')
    ? 'en'
    : 'es';

  return TOUR_TEXT[langCode][key] || TOUR_TEXT.es[key] || key;
}

function cleanupStoreScene() {
  if (!store3DState) {
    return;
  }

  const { handlers, container, overlayContainer } = store3DState;

  if (handlers.onMouseMove) {
    container.removeEventListener('mousemove', handlers.onMouseMove);
  }
  if (handlers.onMouseLeave) {
    container.removeEventListener('mouseleave', handlers.onMouseLeave);
  }
  if (handlers.onResize) {
    window.removeEventListener('resize', handlers.onResize);
  }
  if (handlers.onLanguageChanged) {
    document.removeEventListener('app:language-changed', handlers.onLanguageChanged);
  }
  if (handlers.onThemeChanged) {
    document.removeEventListener('app:theme-changed', handlers.onThemeChanged);
  }

  if (store3DState.animationFrameId) {
    cancelAnimationFrame(store3DState.animationFrameId);
  }

  if (store3DState.controls && store3DState.controls.dispose) {
    store3DState.controls.dispose();
  }

  store3DState.shelfMeshes.forEach((mesh) => {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material && mesh.material.dispose) {
      mesh.material.dispose();
    }
    store3DState.scene.remove(mesh);
  });

  if (store3DState.renderer) {
    store3DState.renderer.dispose();
    const canvas = store3DState.renderer.domElement;
    if (canvas?.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  if (overlayContainer) {
    overlayContainer.innerHTML = '';
  }

  store3DState = null;
}

window.initializeStoreScene = initializeStoreScene;

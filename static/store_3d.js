/**
 * store_3d.js - Immersive Three.js virtual tour for store detail.
 * Renders shelves as 3D boxes and projects HTML overlays with shelf inventory.
 */

let store3DState = null;

const SHELF_EMISSIVE_BASE = 0x081a32;
const SHELF_EMISSIVE_HOVER = 0x1b78d6;

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
    58,
    Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
    0.1,
    1500
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.domElement.style.touchAction = 'none';
  container.appendChild(renderer.domElement);

  const controls = createOrbitControls(camera, renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xf3f8ff, 0x7d8591, 0.44);
  scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.05);
  directionalLight.position.set(18, 24, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.bias = -0.0002;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 90;
  scene.add(directionalLight);

  const fillLight = new THREE.PointLight(0x9ecbff, 0.35, 180, 2);
  fillLight.position.set(-14, 14, -10);
  scene.add(fillLight);

  const floorGeometry = new THREE.PlaneGeometry(140, 140);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xb7c1cb,
    roughness: 0.84,
    metalness: 0.15
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
    hoveredOverlayShelfId: null,
    animationFrameId: null,
    handlers: {},
    bounds: null,
    panLimits: null,
    pointerDown: null,
    focusAnimation: null
  };

  createShelfMeshes(shelves);
  configureInitialView();
  bind3DEvents();
  animateStoreScene();
}

function createOrbitControls(camera, domElement) {
  if (!THREE.OrbitControls) {
    return null;
  }

  const controls = new THREE.OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI / 2 - 0.06;
  controls.rotateSpeed = 0.72;
  controls.zoomSpeed = 0.92;
  controls.panSpeed = 0.85;

  if (controls.mouseButtons && THREE.MOUSE) {
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  }

  if (controls.touches && THREE.TOUCH) {
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  }

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

    const geometry = new THREE.BoxGeometry(3.7, 2.9, 1.75);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2a5f9e,
      roughness: 0.34,
      metalness: 0.28,
      emissive: SHELF_EMISSIVE_BASE,
      emissiveIntensity: 0.42
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, 1.2, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { shelfId };

    buildShelfDetails(mesh, index);
    populateShelfWithProducts(mesh, productRows);

    store3DState.scene.add(mesh);
    store3DState.shelfMeshes.push(mesh);

    const overlayEntry = {
      shelfId,
      shelfName,
      rows: productRows,
      element: createOverlayCard(shelfId, shelfName, productRows)
    };

    store3DState.overlayContainer.appendChild(overlayEntry.element);
    store3DState.overlayByShelfId.set(shelfId, overlayEntry);
  });
}

function buildShelfDetails(shelfMesh, shelfIndex) {
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f566e,
    roughness: 0.5,
    metalness: 0.52
  });

  const boardMaterial = new THREE.MeshStandardMaterial({
    color: shelfIndex % 2 === 0 ? 0xd9e0e7 : 0xcfd9e2,
    roughness: 0.62,
    metalness: 0.2
  });

  const backPanelMaterial = new THREE.MeshStandardMaterial({
    color: 0x9db0c3,
    roughness: 0.74,
    metalness: 0.16
  });

  const frameGeometry = new THREE.BoxGeometry(0.1, 2.86, 0.1);
  const frameOffsets = [
    [-1.72, 0, -0.8],
    [1.72, 0, -0.8],
    [-1.72, 0, 0.8],
    [1.72, 0, 0.8]
  ];

  frameOffsets.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(frameGeometry, frameMaterial);
    post.position.set(x, y, z);
    post.castShadow = true;
    post.receiveShadow = true;
    shelfMesh.add(post);
  });

  const boardGeometry = new THREE.BoxGeometry(3.5, 0.1, 1.64);
  [-1.15, -0.32, 0.52, 1.28].forEach((levelY) => {
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(0, levelY, 0);
    board.castShadow = true;
    board.receiveShadow = true;
    shelfMesh.add(board);
  });

  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.75, 0.06), backPanelMaterial);
  backPanel.position.set(0, 0.02, -0.83);
  backPanel.receiveShadow = true;
  shelfMesh.add(backPanel);
}

function populateShelfWithProducts(shelfMesh, productRows) {
  const distinctRows = [];
  const seenProducts = new Set();

  productRows.forEach((row, index) => {
    const key = row.productId || row.name || String(index);
    if (seenProducts.has(key)) {
      return;
    }
    seenProducts.add(key);
    distinctRows.push(row);
  });

  distinctRows.forEach((row, index) => {
    const visual = createProductVisual(row.productId, index);
    const lane = index % 4;
    const shelfLevel = Math.floor(index / 4) % 3;
    const depthOffset = index % 2 === 0 ? 0.24 : -0.12;

    visual.position.set(
      -1.2 + lane * 0.78,
      -0.92 + shelfLevel * 0.84,
      depthOffset
    );

    shelfMesh.add(visual);
  });
}

function createProductVisual(productId, index) {
  const style = getProductVisualStyle(productId, index);
  const group = new THREE.Group();

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: style.color,
    roughness: 0.34,
    metalness: 0.3
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: style.accent,
    roughness: 0.2,
    metalness: 0.62,
    emissive: 0x111111,
    emissiveIntensity: 0.3
  });

  const baseMesh = new THREE.Mesh(createProductBaseGeometry(style.shape), baseMaterial);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  const detailBand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.12), accentMaterial);
  detailBand.position.set(0, -0.05, 0.21);
  detailBand.castShadow = true;
  group.add(detailBand);

  const topDetail = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), accentMaterial);
  topDetail.position.set(0, 0.19, 0);
  topDetail.castShadow = true;
  group.add(topDetail);

  const rotationOffsets = [0.12, 0.5, -0.25, 0.76, -0.4, 0.32, -0.62, 0.2];
  group.rotation.y = rotationOffsets[index % rotationOffsets.length];

  return group;
}

function createProductBaseGeometry(shape) {
  switch (shape) {
    case 'cylinder':
      return new THREE.CylinderGeometry(0.16, 0.16, 0.34, 18);
    case 'cone':
      return new THREE.ConeGeometry(0.17, 0.34, 18);
    case 'sphere':
      return new THREE.SphereGeometry(0.18, 18, 18);
    case 'torus':
      return new THREE.TorusGeometry(0.15, 0.06, 12, 20);
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(0.19, 0);
    case 'box':
    default:
      return new THREE.BoxGeometry(0.34, 0.28, 0.28);
  }
}

function getProductVisualStyle(productId, index) {
  const suffix = (productId || '').split(':').pop();

  switch (suffix) {
    case 'laptop-asus':
      return { shape: 'box', color: 0x3f88c5, accent: 0xf8f7ff };
    case 'monitor-lg':
      return { shape: 'cylinder', color: 0x1f2933, accent: 0x8da2b8 };
    case 'mouse-logitech':
      return { shape: 'sphere', color: 0xc7d3dd, accent: 0x335c67 };
    case 'keyboard-mechanical':
      return { shape: 'box', color: 0x2f7dba, accent: 0xff6b6b };
    case 'headphones-sony':
      return { shape: 'torus', color: 0x2d3142, accent: 0xf4d35e };
    case 'webcam-logitech':
      return { shape: 'sphere', color: 0x4f5d75, accent: 0xffffff };
    case 'usb-dock':
      return { shape: 'box', color: 0x8d99ae, accent: 0x2b2d42 };
    case 'ssd-samsung':
      return { shape: 'dodecahedron', color: 0xef233c, accent: 0xd7e3fc };
    case 'ram-corsair':
      return { shape: 'cone', color: 0x2ec4b6, accent: 0xfdfffc };
    case 'power-supply':
      return { shape: 'cylinder', color: 0xf4a261, accent: 0x1d3557 };
    default: {
      const fallback = [
        { shape: 'box', color: 0x5f8dd3, accent: 0xffffff },
        { shape: 'sphere', color: 0x7aa0c4, accent: 0x1f2933 },
        { shape: 'cone', color: 0x9db8d5, accent: 0xf6f8fa },
        { shape: 'cylinder', color: 0x4a739c, accent: 0xf4e8c1 }
      ];
      return fallback[index % fallback.length];
    }
  }
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
      productId,
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

function createOverlayCard(shelfId, shelfName, rows) {
  const card = document.createElement('div');
  card.className = 'shelf-overlay-card';
  card.dataset.shelfId = shelfId || '';

  const title = document.createElement('h4');
  title.className = 'shelf-overlay-title';
  title.textContent = shelfName;
  card.appendChild(title);

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'shelf-overlay-empty';
    empty.textContent = getTourText('empty');
    card.appendChild(empty);
  } else {
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
  }

  card.addEventListener('mouseenter', () => {
    setHoveredOverlayShelf(shelfId);
    setHoveredShelf(findShelfMeshById(shelfId));
  });

  card.addEventListener('mouseleave', () => {
    setHoveredOverlayShelf(null);
  });

  card.addEventListener('click', (event) => {
    event.preventDefault();
    const mesh = findShelfMeshById(shelfId);
    if (mesh) {
      focusShelf(mesh);
    }
  });

  return card;
}

function configureInitialView() {
  if (!store3DState) {
    return;
  }

  const bounds = computeShelvesBounds(store3DState.shelfMeshes);
  store3DState.bounds = bounds;
  store3DState.panLimits = {
    minX: bounds.minX - 7,
    maxX: bounds.maxX + 7,
    minZ: bounds.minZ - 7,
    maxZ: bounds.maxZ + 7
  };

  if (!store3DState.controls) {
    return;
  }

  const radius = Math.max(bounds.radius, 4);
  const fitDistance = getFitDistance(radius, store3DState.camera);

  store3DState.controls.target.copy(bounds.center);

  store3DState.camera.position.set(
    bounds.center.x + fitDistance * 0.85,
    bounds.center.y + Math.max(7, fitDistance * 0.65),
    bounds.center.z + fitDistance * 0.85
  );

  store3DState.controls.minDistance = Math.max(5, radius * 0.65);
  store3DState.controls.maxDistance = Math.max(store3DState.controls.minDistance + 10, radius * 4.2);

  clampControlsToBounds();
  store3DState.controls.update();
}

function computeShelvesBounds(meshes) {
  if (!meshes.length) {
    return {
      minX: -4,
      maxX: 4,
      minZ: -4,
      maxZ: 4,
      center: new THREE.Vector3(0, 1.2, 0),
      radius: 8
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  meshes.forEach((mesh) => {
    minX = Math.min(minX, mesh.position.x);
    maxX = Math.max(maxX, mesh.position.x);
    minZ = Math.min(minZ, mesh.position.z);
    maxZ = Math.max(maxZ, mesh.position.z);
  });

  const center = new THREE.Vector3((minX + maxX) / 2, 1.2, (minZ + maxZ) / 2);
  const spanX = Math.max(2, maxX - minX);
  const spanZ = Math.max(2, maxZ - minZ);
  const radius = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    center,
    radius
  };
}

function getFitDistance(radius, camera) {
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const vertical = radius / Math.tan(fov / 2);
  const horizontal = vertical / camera.aspect;
  return Math.max(vertical, horizontal) * 1.25;
}

function bind3DEvents() {
  if (!store3DState) {
    return;
  }

  const onMouseMove = (event) => {
    if (!store3DState) {
      return;
    }

    setPointerFromEvent(event);
    updateHoveredShelf();
  };

  const onMouseLeave = () => {
    setHoveredShelf(null);
    setHoveredOverlayShelf(null);
  };

  const onPointerDown = (event) => {
    store3DState.pointerDown = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
      pointerId: event.pointerId
    };
  };

  const onPointerUp = (event) => {
    if (!store3DState?.pointerDown) {
      return;
    }

    const down = store3DState.pointerDown;
    const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
    const elapsed = Date.now() - down.time;

    if (moved <= 8 && elapsed <= 350) {
      setPointerFromEvent(event);
      const mesh = getIntersectedShelf();
      if (mesh) {
        focusShelf(mesh);
      }
    }

    store3DState.pointerDown = null;
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
  store3DState.container.addEventListener('pointerdown', onPointerDown);
  store3DState.container.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', onResize);
  document.addEventListener('app:language-changed', onLanguageChanged);
  document.addEventListener('app:theme-changed', onThemeChanged);

  store3DState.handlers = {
    onMouseMove,
    onMouseLeave,
    onPointerDown,
    onPointerUp,
    onResize,
    onLanguageChanged,
    onThemeChanged
  };
}

function setPointerFromEvent(event) {
  if (!store3DState) {
    return;
  }

  const rect = store3DState.container.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  store3DState.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  store3DState.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function getIntersectedShelf() {
  if (!store3DState) {
    return null;
  }

  store3DState.raycaster.setFromCamera(store3DState.mouse, store3DState.camera);
  const intersections = store3DState.raycaster.intersectObjects(store3DState.shelfMeshes, false);
  return intersections.length ? intersections[0].object : null;
}

function updateHoveredShelf() {
  const next = getIntersectedShelf();
  setHoveredShelf(next);
}

function setHoveredOverlayShelf(shelfId) {
  if (!store3DState) {
    return;
  }

  store3DState.hoveredOverlayShelfId = shelfId;

  store3DState.overlayByShelfId.forEach((entry) => {
    if (!entry?.element) {
      return;
    }

    if (shelfId && entry.shelfId === shelfId) {
      entry.element.classList.add('is-hovered');
    } else if (store3DState.hoveredShelf?.userData?.shelfId !== entry.shelfId) {
      entry.element.classList.remove('is-hovered');
    }
  });
}

function setHoveredShelf(mesh) {
  if (!store3DState || store3DState.hoveredShelf === mesh) {
    return;
  }

  const prev = store3DState.hoveredShelf;
  if (prev && prev.material) {
    prev.material.emissive.setHex(SHELF_EMISSIVE_BASE);
    const prevOverlay = store3DState.overlayByShelfId.get(prev.userData?.shelfId);
    if (prevOverlay?.element && store3DState.hoveredOverlayShelfId !== prev.userData?.shelfId) {
      prevOverlay.element.classList.remove('is-hovered');
    }
  }

  store3DState.hoveredShelf = mesh;

  if (mesh && mesh.material) {
    mesh.material.emissive.setHex(SHELF_EMISSIVE_HOVER);
    const activeOverlay = store3DState.overlayByShelfId.get(mesh.userData?.shelfId);
    if (activeOverlay?.element) {
      activeOverlay.element.classList.add('is-hovered');
    }
  }
}

function focusShelf(mesh) {
  if (!store3DState?.controls || !mesh) {
    return;
  }

  const controls = store3DState.controls;
  const currentTarget = controls.target.clone();
  const currentPosition = store3DState.camera.position.clone();

  const toCamera = currentPosition.clone().sub(currentTarget);
  if (toCamera.lengthSq() < 0.0001) {
    toCamera.set(1, 0.8, 1);
  }

  const direction = toCamera.normalize();
  direction.y = Math.max(0.4, direction.y);
  direction.normalize();

  const minDistance = controls.minDistance || 5;
  const maxDistance = controls.maxDistance || 40;
  const desiredDistance = THREE.MathUtils.clamp((store3DState.bounds?.radius || 8) * 1.7, minDistance * 1.2, maxDistance * 0.72);

  const endTarget = mesh.position.clone();
  endTarget.y = 1.2;

  const endPosition = endTarget.clone().add(direction.multiplyScalar(desiredDistance));
  endPosition.y = Math.max(endTarget.y + 3.8, endPosition.y);

  const clampedTarget = clampTargetToLimits(endTarget);
  const targetDelta = clampedTarget.clone().sub(endTarget);
  endPosition.add(targetDelta);

  store3DState.focusAnimation = {
    startedAt: performance.now(),
    durationMs: 700,
    startTarget: currentTarget,
    endTarget: clampedTarget,
    startPosition: currentPosition,
    endPosition
  };
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

  updateFocusAnimation();

  if (store3DState.controls) {
    store3DState.controls.update();
    clampControlsToBounds();
  }

  updateOverlayPositions();
  store3DState.renderer.render(store3DState.scene, store3DState.camera);
  store3DState.animationFrameId = requestAnimationFrame(animateStoreScene);
}

function updateFocusAnimation() {
  if (!store3DState?.focusAnimation || !store3DState.controls) {
    return;
  }

  const animation = store3DState.focusAnimation;
  const elapsed = performance.now() - animation.startedAt;
  const progress = THREE.MathUtils.clamp(elapsed / animation.durationMs, 0, 1);
  const eased = easeInOutCubic(progress);

  store3DState.controls.target.lerpVectors(animation.startTarget, animation.endTarget, eased);
  store3DState.camera.position.lerpVectors(animation.startPosition, animation.endPosition, eased);

  if (progress >= 1) {
    store3DState.focusAnimation = null;
  }
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clampControlsToBounds() {
  if (!store3DState?.controls || !store3DState.panLimits) {
    return;
  }

  const controls = store3DState.controls;
  const before = controls.target.clone();
  const clamped = clampTargetToLimits(controls.target);
  const delta = clamped.clone().sub(before);

  if (delta.lengthSq() > 0) {
    controls.target.copy(clamped);
    store3DState.camera.position.add(delta);
  }
}

function clampTargetToLimits(target) {
  if (!store3DState?.panLimits) {
    return target.clone();
  }

  return new THREE.Vector3(
    THREE.MathUtils.clamp(target.x, store3DState.panLimits.minX, store3DState.panLimits.maxX),
    target.y,
    THREE.MathUtils.clamp(target.z, store3DState.panLimits.minZ, store3DState.panLimits.maxZ)
  );
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
    const depthZ = projected.z;
    const normalizedDepth = THREE.MathUtils.clamp((depthZ + 1) * 0.5, 0, 1);
    const depthPriority = Math.round((1 - normalizedDepth) * 1000);

    const isHoverPriority =
      store3DState.hoveredOverlayShelfId === shelfId ||
      store3DState.hoveredShelf?.userData?.shelfId === shelfId;

    entry.element.style.display = 'block';
    entry.element.style.left = `${x}px`;
    entry.element.style.top = `${y}px`;
    entry.element.style.zIndex = `${isHoverPriority ? 4000 : 1000 + depthPriority}`;
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

  if (store3DState.bounds && store3DState.controls) {
    const fitDistance = getFitDistance(Math.max(store3DState.bounds.radius, 4), store3DState.camera);
    store3DState.controls.maxDistance = Math.max(store3DState.controls.minDistance + 10, fitDistance * 2.8);
  }

  store3DState.renderer.setSize(width, height);
}

function findShelfMeshById(shelfId) {
  if (!store3DState || !shelfId) {
    return null;
  }

  return store3DState.shelfMeshes.find((mesh) => mesh.userData?.shelfId === shelfId) || null;
}

function getSceneBackgroundColor() {
  const isDark = document.body.classList.contains('dark-theme');
  return isDark ? 0x111820 : 0xe8eef5;
}

function disposeMaterial(material) {
  if (!material) {
    return;
  }

  if (Array.isArray(material)) {
    material.forEach((entry) => {
      if (entry?.dispose) {
        entry.dispose();
      }
    });
    return;
  }

  if (material.dispose) {
    material.dispose();
  }
}

function disposeObject3D(root) {
  if (!root) {
    return;
  }

  root.traverse((node) => {
    if (node.geometry?.dispose) {
      node.geometry.dispose();
    }
    disposeMaterial(node.material);
  });
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
  if (handlers.onPointerDown) {
    container.removeEventListener('pointerdown', handlers.onPointerDown);
  }
  if (handlers.onPointerUp) {
    container.removeEventListener('pointerup', handlers.onPointerUp);
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

  if (store3DState.controls?.dispose) {
    store3DState.controls.dispose();
  }

  store3DState.shelfMeshes.forEach((mesh) => {
    disposeObject3D(mesh);
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

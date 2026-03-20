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

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(12, 22, 14);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const floorGeometry = new THREE.PlaneGeometry(140, 140);
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
      element: createOverlayCard(shelfId, shelfName, productRows)
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
    prev.material.emissive.setHex(0x000000);
    const prevOverlay = store3DState.overlayByShelfId.get(prev.userData?.shelfId);
    if (prevOverlay?.element && store3DState.hoveredOverlayShelfId !== prev.userData?.shelfId) {
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
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material?.dispose) {
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

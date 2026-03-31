import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Create and configure the Three.js scene, camera, renderer, controls, and basic environment.
 *
 * @param {HTMLElement} mountEl DOM element to mount the renderer canvas into.
 * @returns {{
 *  scene: THREE.Scene,
 *  camera: THREE.PerspectiveCamera,
 *  renderer: THREE.WebGLRenderer,
 *  controls: OrbitControls,
 *  cleanup: () => void
 * }}
 */
export function createScene(mountEl) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f3f4f6");

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(10, 7, 12);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  // Cap DPR for performance on very high DPI screens.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  mountEl.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  // Keep camera framing sensible.
  controls.minDistance = 6;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 1.2, 0);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.95);
  dir.position.set(10, 12, 6);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.near = 0.5;
  dir.shadow.camera.far = 60;
  dir.shadow.camera.left = -25;
  dir.shadow.camera.right = 25;
  dir.shadow.camera.top = 25;
  dir.shadow.camera.bottom = -25;
  scene.add(dir);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(60, 60, 1, 1);
  const groundMat = new THREE.MeshStandardMaterial({
    color: "#e5e7eb",
    roughness: 1,
    metalness: 0
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Subtle grid for context (optional but useful).
  const grid = new THREE.GridHelper(60, 30, 0x9ca3af, 0xd1d5db);
  grid.position.y = 0.001; // avoid z-fighting with ground plane
  scene.add(grid);

  // Resize handling
  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = mountEl.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  resizeObserver.observe(mountEl);

  // Initial size set.
  {
    const { width, height } = mountEl.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  // Cleanup for HMR / teardown.
  const cleanup = () => {
    resizeObserver.disconnect();
    controls.dispose();
    renderer.dispose();

    // Remove canvas node if still present.
    if (renderer.domElement.parentElement === mountEl) {
      mountEl.removeChild(renderer.domElement);
    }
  };

  return { scene, camera, renderer, controls, cleanup };
}

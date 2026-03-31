import * as THREE from "three";

/**
 * Start the render loop.
 *
 * Car motion is time-based (delta seconds). The car moves forward along +Z and wraps around to a start position.
 *
 * @param {{
 *  scene: THREE.Scene,
 *  camera: THREE.PerspectiveCamera,
 *  renderer: THREE.WebGLRenderer,
 *  controls: { update: () => void },
 *  carGroup: THREE.Group,
 *  wheels: THREE.Mesh[],
 *  wheelRadius: number
 * }} params
 * @returns {() => void} Stop function to cancel the animation loop.
 */
export function startAnimationLoop(params) {
  const { scene, camera, renderer, controls, carGroup, wheels, wheelRadius } = params;

  let rafId = 0;
  let lastT = performance.now();

  // Movement tuning
  const speed = 3.2; // units per second
  const zMin = -18;
  const zMax = 18;

  // Wheel rotation approximated from distance traveled: theta += distance / radius
  // Ensure safe radius.
  const r = Math.max(0.0001, wheelRadius);

  function frame(t) {
    rafId = requestAnimationFrame(frame);

    const dt = Math.min(0.05, (t - lastT) / 1000); // clamp to avoid huge jumps
    lastT = t;

    controls.update();

    const dz = speed * dt;
    carGroup.position.z += dz;

    if (carGroup.position.z > zMax) {
      carGroup.position.z = zMin;
    }

    const dTheta = dz / r;

    // Wheels were built with cylinder axis aligned to X; to "roll" forward along +Z,
    // rotate around X (like a real axle). This matches our geometry orientation.
    for (const w of wheels) {
      w.rotation.x -= dTheta;
    }

    renderer.render(scene, camera);
  }

  rafId = requestAnimationFrame(frame);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };
}

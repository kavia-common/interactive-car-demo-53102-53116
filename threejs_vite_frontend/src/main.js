import "./style.css";
import { createScene } from "./three/createScene.js";
import { createCar } from "./three/createCar.js";
import { startAnimationLoop } from "./three/animate.js";

const viewportEl = document.getElementById("viewport");

if (!viewportEl) {
  throw new Error("Missing #viewport element");
}

const { scene, camera, renderer, controls, cleanup } = createScene(viewportEl);
const { carGroup, wheels, wheelRadius } = createCar();

// Place the car slightly above ground so wheels don't clip.
carGroup.position.set(0, 0, -12);
scene.add(carGroup);

// Start render + animation loop.
const stop = startAnimationLoop({
  scene,
  camera,
  renderer,
  controls,
  carGroup,
  wheels,
  wheelRadius
});

// Ensure we cleanup WebGL resources on hot reload / navigation.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stop();
    cleanup();
  });
}

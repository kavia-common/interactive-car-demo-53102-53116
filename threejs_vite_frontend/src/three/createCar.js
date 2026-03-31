import * as THREE from "three";

/**
 * Create a minimal stylized car model from geometric primitives.
 *
 * Returns a THREE.Group so it can be moved as a single object, and an array of wheel meshes for rotation.
 *
 * @returns {{
 *  carGroup: THREE.Group,
 *  wheels: THREE.Mesh[],
 *  wheelRadius: number
 * }}
 */
export function createCar() {
  const carGroup = new THREE.Group();

  // Dimensions (units are arbitrary but consistent).
  const bodyLength = 4.2;
  const bodyWidth = 2.1;
  const bodyHeight = 0.8;

  const cabinLength = 2.2;
  const cabinWidth = 1.75;
  const cabinHeight = 0.75;

  const wheelRadius = 0.42;
  const wheelThickness = 0.32;

  // Materials (reused across meshes).
  const bodyMat = new THREE.MeshStandardMaterial({
    color: "#3b82f6",
    roughness: 0.35,
    metalness: 0.05
  });

  const cabinMat = new THREE.MeshStandardMaterial({
    color: "#60a5fa",
    roughness: 0.4,
    metalness: 0.02
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: "#111827",
    roughness: 0.9,
    metalness: 0.05
  });

  // Body
  const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.position.y = wheelRadius + bodyHeight / 2;
  carGroup.add(body);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.castShadow = true;
  cabin.position.y = wheelRadius + bodyHeight + cabinHeight / 2 - 0.05;
  cabin.position.z = -0.2; // slightly rearward
  carGroup.add(cabin);

  // Wheels (cylinders). Axis should be left-right (X), so rotate cylinder from Y to X.
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24, 1);

  // Rotate so cylinder's axis aligns with X (axle).
  wheelGeo.rotateZ(Math.PI / 2);

  const wheels = [];

  const halfW = bodyWidth / 2;
  const halfL = bodyLength / 2;

  // Small offsets so wheels sit just outside body.
  const xOut = halfW + wheelThickness / 2 - 0.04;

  const wheelPositions = [
    new THREE.Vector3(+xOut, wheelRadius, +halfL - 0.65), // front-right
    new THREE.Vector3(-xOut, wheelRadius, +halfL - 0.65), // front-left
    new THREE.Vector3(+xOut, wheelRadius, -halfL + 0.65), // rear-right
    new THREE.Vector3(-xOut, wheelRadius, -halfL + 0.65) // rear-left
  ];

  for (const pos of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.castShadow = true;
    wheel.position.copy(pos);
    carGroup.add(wheel);
    wheels.push(wheel);
  }

  // A subtle "bumper" hint (optional but still primitives).
  const bumperGeo = new THREE.BoxGeometry(bodyWidth * 0.98, 0.18, 0.25);
  const bumperMat = new THREE.MeshStandardMaterial({
    color: "#1f2937",
    roughness: 0.7,
    metalness: 0.1
  });

  const bumperFront = new THREE.Mesh(bumperGeo, bumperMat);
  bumperFront.castShadow = true;
  bumperFront.position.set(0, wheelRadius + 0.18 / 2, halfL - 0.1);
  carGroup.add(bumperFront);

  const bumperRear = new THREE.Mesh(bumperGeo, bumperMat);
  bumperRear.castShadow = true;
  bumperRear.position.set(0, wheelRadius + 0.18 / 2, -halfL + 0.1);
  carGroup.add(bumperRear);

  // Keep group origin near car center at ground contact level.
  // (Wheels already define y=wheelRadius, so ground is at y=0.)
  carGroup.position.y = 0;

  return { carGroup, wheels, wheelRadius };
}

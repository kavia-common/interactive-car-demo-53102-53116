/* global window, requestAnimationFrame */
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Minimal interactive Three.js car demo:
 * - Simple car built from primitives
 * - Ground plane + lights
 * - OrbitControls
 * - Animate car moving forward and wheels rotating
 */

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="appShell">
    <div class="canvasWrap" id="canvasWrap"></div>

    <footer class="footer">
      <div class="footer__left">
        <strong>Interactive Car Demo</strong>
        <span class="muted">Orbit: drag · Zoom: wheel · Pan: right-drag</span>
      </div>
      <div class="footer__right">
        <span class="muted">Built with Vite + Three.js</span>
      </div>
    </footer>
  </div>
`

const canvasWrap = document.getElementById('canvasWrap')

/**
 * Three.js scene setup
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color('#f9fafb')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
canvasWrap.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
camera.position.set(7, 4, 9)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.target.set(0, 1.1, 0)
controls.maxPolarAngle = Math.PI * 0.48
controls.minDistance = 4
controls.maxDistance = 30
controls.update()

/**
 * Lights
 */
const hemi = new THREE.HemisphereLight(0xffffff, 0x93a3b8, 0.8)
scene.add(hemi)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.1)
dirLight.position.set(8, 10, 6)
dirLight.castShadow = true
dirLight.shadow.mapSize.set(1024, 1024)
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far = 40
dirLight.shadow.camera.left = -15
dirLight.shadow.camera.right = 15
dirLight.shadow.camera.top = 15
dirLight.shadow.camera.bottom = -15
scene.add(dirLight)

/**
 * Ground plane
 */
const groundGeo = new THREE.PlaneGeometry(200, 200)
const groundMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 1 })
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// Simple "road" stripe for motion reference
const roadGeo = new THREE.PlaneGeometry(6, 200)
const roadMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 1 })
const road = new THREE.Mesh(roadGeo, roadMat)
road.rotation.x = -Math.PI / 2
road.position.y = 0.001
road.receiveShadow = false
scene.add(road)

/**
 * Car model (group of primitives)
 */
function createWheel() {
  const wheelGroup = new THREE.Group()

  const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 24)
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
  const tire = new THREE.Mesh(tireGeo, tireMat)
  tire.rotation.z = Math.PI / 2
  tire.castShadow = true
  tire.receiveShadow = true
  wheelGroup.add(tire)

  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.29, 18)
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.2, roughness: 0.5 })
  const rim = new THREE.Mesh(rimGeo, rimMat)
  rim.rotation.z = Math.PI / 2
  rim.castShadow = true
  wheelGroup.add(rim)

  // A small spoke marker to see rotation
  const spokeGeo = new THREE.BoxGeometry(0.04, 0.02, 0.36)
  const spokeMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.6 })
  const spoke = new THREE.Mesh(spokeGeo, spokeMat)
  spoke.castShadow = true
  wheelGroup.add(spoke)

  return wheelGroup
}

function createCar() {
  const car = new THREE.Group()
  car.name = 'Car'

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.45,
    metalness: 0.15,
  })

  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.35,
    metalness: 0.12,
    transparent: true,
    opacity: 0.95,
  })

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(3.2, 0.55, 1.6)
  const chassis = new THREE.Mesh(chassisGeo, bodyMat)
  chassis.position.y = 0.55
  chassis.castShadow = true
  chassis.receiveShadow = true
  car.add(chassis)

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.55, 1.3)
  const cabin = new THREE.Mesh(cabinGeo, cabinMat)
  cabin.position.set(-0.2, 1.05, 0)
  cabin.castShadow = true
  cabin.receiveShadow = true
  car.add(cabin)

  // Front "bumper" accent
  const bumperGeo = new THREE.BoxGeometry(0.45, 0.25, 1.55)
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 })
  const bumper = new THREE.Mesh(bumperGeo, bumperMat)
  bumper.position.set(1.6, 0.45, 0)
  bumper.castShadow = true
  car.add(bumper)

  // Wheels
  const wheelFL = createWheel()
  const wheelFR = createWheel()
  const wheelRL = createWheel()
  const wheelRR = createWheel()

  const wheelY = 0.35
  const frontX = 1.1
  const rearX = -1.1
  const offsetZ = 0.85

  wheelFL.position.set(frontX, wheelY, offsetZ)
  wheelFR.position.set(frontX, wheelY, -offsetZ)
  wheelRL.position.set(rearX, wheelY, offsetZ)
  wheelRR.position.set(rearX, wheelY, -offsetZ)

  car.add(wheelFL, wheelFR, wheelRL, wheelRR)

  // Keep a reference for animation
  car.userData.wheels = [wheelFL, wheelFR, wheelRL, wheelRR]

  return car
}

const car = createCar()
car.position.set(0, 0, 0)
scene.add(car)

/**
 * Resize handling
 */
function resizeRendererToDisplaySize() {
  const w = canvasWrap.clientWidth
  const h = canvasWrap.clientHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resizeRendererToDisplaySize)
resizeRendererToDisplaySize()

/**
 * Animation: car moves forward in +X and wraps around; wheels rotate according to distance traveled.
 */
const clock = new THREE.Clock()
const wheelRadius = 0.38
const speed = 2.2 // units/sec
const wrapMinX = -10
const wrapMaxX = 10

function animate() {
  requestAnimationFrame(animate)

  const dt = Math.min(clock.getDelta(), 0.05)

  // Move car forward
  const dx = speed * dt
  car.position.x += dx

  if (car.position.x > wrapMaxX) car.position.x = wrapMinX

  // Rotate wheels based on distance traveled: angle = distance / radius
  const rot = dx / wheelRadius
  for (const w of car.userData.wheels) {
    w.rotation.x -= rot
  }

  // Slight steering wiggle for visual interest (small yaw oscillation)
  car.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.06

  controls.update()
  renderer.render(scene, camera)
}

animate()

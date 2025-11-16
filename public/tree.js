import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("bg"),
  alpha: true
});
renderer.setSize(innerWidth, innerHeight);

// Partículas
const particles = new THREE.BufferGeometry();
const count = 3500;
const posArray = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 12;
}

particles.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
  size: 0.015,
  color: "#28ffbf",
  transparent: true,
  opacity: 0.85,
});

const mesh = new THREE.Points(particles, material);
scene.add(mesh);

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.0005;
  mesh.rotation.x += 0.0002;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

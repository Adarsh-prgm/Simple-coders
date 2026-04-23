// Initialize Three.js Scene for the 3D moving particle/star background

const canvas = document.getElementById('bg-canvas');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.z = 20;

// Particles Geometry
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 800; // Optimal for lightweight performance
const posArray = new Float32Array(particlesCount * 3);
const velocityArray = new Float32Array(particlesCount); // For subtle wiggling/speed

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread stars out
    posArray[i] = (Math.random() - 0.5) * 60; 
}

for(let i = 0; i < particlesCount; i++) {
    velocityArray[i] = Math.random() * 0.02 + 0.005; // Random speeds for falling effect
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Particle Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: 0x93c5fd, // Tailwind blue-300
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Add faint nebula background spheres
const geometryNebula = new THREE.SphereGeometry(15, 32, 32);
const materialNebula1 = new THREE.MeshBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.1 });
const materialNebula2 = new THREE.MeshBasicMaterial({ color: 0x581c87, transparent: true, opacity: 0.08 });

const nebula1 = new THREE.Mesh(geometryNebula, materialNebula1);
nebula1.position.set(-10, 5, -10);
scene.add(nebula1);

const nebula2 = new THREE.Mesh(geometryNebula, materialNebula2);
nebula2.position.set(10, -5, -15);
scene.add(nebula2);

// Mouse interaction tracking (Subtle effect)
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Rotate the entire particle system slowly
    particlesMesh.rotation.y = elapsedTime * 0.01;
    particlesMesh.rotation.x = elapsedTime * 0.005;

    // Subtle nebulas rotation
    nebula1.rotation.y = elapsedTime * 0.1;
    nebula2.rotation.y = elapsedTime * -0.1;

    // React to mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

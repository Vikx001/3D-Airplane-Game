
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a32); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '20px';
scoreElement.style.fontFamily = 'Arial';
scoreElement.innerHTML = 'Score: 0';
document.body.appendChild(scoreElement);


const restartButton = document.createElement('button');
restartButton.innerHTML = 'Restart';
restartButton.style.position = 'absolute';
restartButton.style.top = '50%';
restartButton.style.left = '50%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.padding = '10px 20px';
restartButton.style.fontSize = '18px';
restartButton.style.display = 'none';
restartButton.addEventListener('click', () => location.reload());
document.body.appendChild(restartButton);


const world = new CANNON.World();
world.gravity.set(0, 0, 0); 

const airplaneGeometry = new THREE.BoxGeometry(1, 0.5, 2);
const airplaneMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const airplane = new THREE.Mesh(airplaneGeometry, airplaneMaterial);
scene.add(airplane);

const airplaneBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1)),
    position: new CANNON.Vec3(0, 2, 0)
});
world.addBody(airplaneBody);


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function updateAirplane() {
    const boundaryX = 4;
    const boundaryY = 3;
    if (keys['ArrowUp'] && airplaneBody.position.y < boundaryY) airplaneBody.position.y += 0.15;
    if (keys['ArrowDown'] && airplaneBody.position.y > -boundaryY) airplaneBody.position.y -= 0.15;
    if (keys['ArrowLeft'] && airplaneBody.position.x > -boundaryX) airplaneBody.position.x -= 0.15;
    if (keys['ArrowRight'] && airplaneBody.position.x < boundaryX) airplaneBody.position.x += 0.15;
}

const buildings = [];
function createBuilding(x, z) {
    const height = Math.random() * 8 + 4;
    const width = Math.random() * 2 + 3;
    const colors = [0xff5733, 0x33ff57, 0x3357ff, 0xffff33, 0xff33ff, 0x33ffff]; 
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const buildingGeometry = new THREE.BoxGeometry(width, height, width);
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: color, metalness: 0.3, roughness: 0.6 });
    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingMesh.position.set(x, height / 2, z);
    scene.add(buildingMesh);
    
    const buildingBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, width / 2)),
        position: new CANNON.Vec3(x, height / 2, z)
    });
    world.addBody(buildingBody);
    buildings.push({ mesh: buildingMesh, body: buildingBody });
}

function generateBuildings() {
    for (let i = 0; i < 10; i++) {
        let xPosition = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 2);
        createBuilding(xPosition, -i * 15);
    }
}
generateBuildings();

function checkCollisions() {
    for (let building of buildings) {
        let airplaneBox = new THREE.Box3().setFromObject(airplane);
        let buildingBox = new THREE.Box3().setFromObject(building.mesh);
        if (airplaneBox.intersectsBox(buildingBox)) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    alert('Game Over!');
    restartButton.style.display = 'block';
    cancelAnimationFrame(animationFrameId);
}

let speed = 0.07;
let score = 0;
function increaseSpeed() {
    speed += 0.0003;
    score += 1;
    scoreElement.innerHTML = `Score: ${score}`;
}

let animationFrameId;
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    world.step(1 / 60);
    updateAirplane();
    checkCollisions();
    increaseSpeed();
    for (let building of buildings) {
        building.mesh.position.z += speed;
        building.body.position.z += speed;
        if (building.mesh.position.z > 5) {
            building.mesh.position.z = -60;
            building.body.position.z = -60;
            building.mesh.position.x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 2);
            building.body.position.x = building.mesh.position.x;
            const newColor = colors[Math.floor(Math.random() * colors.length)];
            building.mesh.material.color.setHex(newColor);
        }
    }
    
    airplane.position.copy(airplaneBody.position);
    renderer.render(scene, camera);
}
animate();
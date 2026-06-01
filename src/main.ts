import * as THREE from "three";
import { Text } from "troika-three-text";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create:
const myText = new Text();

// Set properties to configure:
myText.text = "Hello world!";
myText.fontSize = 0.4;
myText.position.z = -2;
myText.position.x = -1;
myText.position.y = 2;
myText.color = "red";

scene.add(myText);

const timer = new THREE.Timer();

camera.position.z = 5;

function animate(time: number) {
  timer.update();
  const elapsed = timer.getElapsed();

  if (elapsed > 10.0) {
    cube.rotation.x = time / 1000;
    cube.rotation.y = elapsed / 1000;
    myText.rotation.x = elapsed / 1000;
    myText.rotation.y = elapsed / 1000;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

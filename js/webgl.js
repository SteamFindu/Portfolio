import * as THREE from "../node_modules/three/build/three.module.js";

import {OrbitControls} from "../node_modules/three/examples/jsm/controls/OrbitControls.js";


let container;
let camera;
let renderer;
let scene;
let material;
let linematerial;
let mesh;
let line;
let geometry;
let wireframe;
let controls;

const amount = 8;
const dummy = new THREE.Object3D();


function init() {
  container = document.querySelector('#cont');
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFE77F');

  createCamera();
  createLights();
  createMaterials();
  createGeometries();
  createMeshes();
  createRenderer();

  controls = new OrbitControls(camera, container);


  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

function createCamera() {
  // camera settings
  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 100;

  // camera creation
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 40);
}


function createLights() {

  const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 2);

  const mainLight = new THREE.DirectionalLight(0x48FE9A, 2);
  mainLight.position.set(.2, .2, .4,);
  scene.add(mainLight, ambientLight);
}

function createMaterials() {
  material = new THREE.MeshPhongMaterial({color: 'orange'});
  linematerial = new THREE.MeshPhongMaterial({color: 'blue'});
}

function createGeometries() {
  geometry = new THREE.TorusKnotBufferGeometry(6, 2, 64, 10, 3, 2);
  wireframe = new THREE.WireframeGeometry(geometry);

}

function createMeshes() {
  mesh = new THREE.InstancedMesh(geometry, material, 30)
  mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );


  line = new THREE.LineSegments(wireframe, linematerial)
  line.material.depthTest = true;
  line.material.opacity = 1.0;
  line.material.transparency = true;

  scene.add(mesh);
}


function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.gammaFactor = 2.2;
  renderer.physicallyCorrectLights = true;
  container.appendChild(renderer.domElement);
}

function update() {
  mesh.rotation.y += 0.01;
  line.rotation.y += 0.01;
}

function render() {
  if (mesh) {

    let time = Date.now() * 0.001;

    mesh.rotation.x = Math.sin(time / 4);
    mesh.rotation.y = Math.sin(time / 2);

    let i = 0;
    let offset = (amount - 1) / 2;

    for (let x = 0; x < amount; x++) {

      for (let y = 0; y < amount; y++) {

        for (let z = 0; z < amount; z++) {

          dummy.position.set(offset - x, offset - y, offset - z);
          dummy.rotation.z = dummy.rotation.y * 2;

          dummy.updateMatrix();

          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  renderer.render(scene, camera);
}

init();

// on window resize event
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
})


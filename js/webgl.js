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

let instanceColors = [];

const amount = 8;
const count = Math.pow(amount, 3);
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
  material = new THREE.MeshPhongMaterial({color: 'white'});

  let colorParsChunk = [
    'attribute vec3 instanceColor;',
    'varying vec3 vInstanceColor;',
    '#include <common>'
  ].join( '\n' );

  let instanceColorChunk = [
    '#include <begin_vertex>',
    '\tvInstanceColor = instanceColor;'
  ].join( '\n' );

  let fragmentParsChunk = [
    'varying vec3 vInstanceColor;',
    '#include <common>'
  ].join( '\n' );

  let colorChunk = [
    'vec4 diffuseColor = vec4( diffuse * vInstanceColor, opacity );'
  ].join( '\n' );

  material.onBeforeCompile = function ( shader ) {

    shader.vertexShader = shader.vertexShader
      .replace( '#include <common>', colorParsChunk )
      .replace( '#include <begin_vertex>', instanceColorChunk );

    shader.fragmentShader = shader.fragmentShader
      .replace( '#include <common>', fragmentParsChunk )
      .replace( 'vec4 diffuseColor = vec4( diffuse, opacity );', colorChunk );

    //console.log( shader.uniforms );
    //console.log( shader.vertexShader );
    //console.log( shader.fragmentShader );

  };

  linematerial = new THREE.MeshPhongMaterial({color: 'blue'});
}

function createGeometries() {
  geometry = new THREE.OctahedronBufferGeometry(8);
  geometry.scale(0.3,0.3,0.3)


  for ( let i = 0; i < count; i ++ ) {

    instanceColors.push( Math.random() );
    instanceColors.push( Math.random() );
    instanceColors.push( Math.random() );

  }

  geometry.setAttribute( 'instanceColor', new THREE.InstancedBufferAttribute( new Float32Array( instanceColors ), 3 ) );


  wireframe = new THREE.WireframeGeometry(geometry);

}

function createMeshes() {
  mesh = new THREE.InstancedMesh(geometry, material, count)
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
    let offset = (amount - 1) * 2.5;

    for (let x = 0; x < amount; x++) {

      for (let y = 0; y < amount; y++) {

        for (let z = 0; z < amount; z++) {

          dummy.position.set(offset - x * 5, offset - y * 5, offset - z * 5);
          dummy.rotation.z = dummy.rotation.y * 2;

          dummy.updateMatrix();

          mesh.setMatrixAt(i++, dummy.matrix);
          mesh.color = getRandomColor();
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

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


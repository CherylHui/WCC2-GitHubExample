/*
  Getting started with post-processing:
  https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing 

  Look at some more examples:
  https://threejs.org/examples/?q=postprocessing

  To get started:
  - only the first time on the command line run:
      npm install 
  - Every time you develop / test (look at package.json to change port for static server):
      npm run dev
  - To build your static site:
      npm run build
  - To preview a static site / build, after you have run the above command:
      npm run preview

*/

//import three.js
import * as THREE from 'three';
//add Orbit controls
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';//Dat Gui

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let camera, renderer, composer;
let object;

let bloomPass;

let controls, gui;

const params = {
  threshold: 0,
  strength: 1,
  radius: 0,
  exposure: 1
};

//initialize then call animation loop
init();
animate();

function init() {
  
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ReinhardToneMapping;
  document.body.appendChild( renderer.domElement );


  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

  object = new THREE.Object3D();
  scene.add( object );

  const geometry = new THREE.SphereGeometry( 1, 4, 4 );
  

  for ( let i = 0; i < 100; i ++ ) {

    const color = new THREE.Color( THREE.MathUtils.randFloat(0,1), THREE.MathUtils.randFloat(0,1), THREE.MathUtils.randFloat(0,1) );
    const material = new THREE.MeshPhongMaterial( { color: color, flatShading: true } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
    mesh.position.multiplyScalar( Math.random() * 400 );
    mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
    object.add( mesh );

  }

  scene.add( new THREE.AmbientLight( 0xcccccc ) );

  const light = new THREE.DirectionalLight( 0xffffff, 3 );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  // postprocessing
  composer = new EffectComposer( renderer );
  composer.setSize( window.innerWidth, window.innerHeight );
  composer.addPass( new RenderPass( scene, camera ) );//main render pass

  bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;
  composer.addPass( bloomPass );//glow effect pass

  
  const outPut = new OutputPass();
  composer.addPass( outPut );


  createGui();

  //add event listener, when window is resized call onWindowResize callback
  window.addEventListener('resize', onWindowResize );
}

function animate() {

  requestAnimationFrame( animate );

  object.rotation.x += 0.005;
  object.rotation.y += 0.01;

  controls.update();

  composer.render();
}


function createGui(){
  gui = new GUI();

  const bloomFolder = gui.addFolder( 'bloom' );

  bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

    bloomPass.threshold = Number( value );

  } );

  bloomFolder.add( params, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

    bloomPass.strength = Number( value );

  } );

  gui.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

    bloomPass.radius = Number( value );

  } );

  const toneMappingFolder = gui.addFolder( 'tone mapping' );

  toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

    renderer.toneMappingExposure = Math.pow( value, 4.0 );

  } );

}

function onWindowResize() {
  
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );

}
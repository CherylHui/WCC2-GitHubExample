/*
  Adaptation of this: https://threejs.org/examples/?q=shader#webgl_shader_lava

  Showing how textures are used & tiled

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

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';//camera controls
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';//Dat Gui

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {tiledMaterial} from '../tiledShader.js'

let camera, scene, renderer, composer, clock;
let controls, gui;

let mesh;

init();
animate();

function init() {

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 4;

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = false;
  document.body.appendChild( renderer.domElement );

  //post-processing
  const renderModel = new RenderPass( scene, camera );
  const effectBloom = new BloomPass( 1 );
  const outputPass = new OutputPass();

  composer = new EffectComposer( renderer );
  composer.setSize( window.innerWidth, window.innerHeight );

  composer.addPass( renderModel );
  composer.addPass( effectBloom );
  composer.addPass( outputPass );

  // camera user interaction controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  clock = new THREE.Clock();

  const textureLoader = new THREE.TextureLoader();

  const noisyTexture = textureLoader.load( 'public/textures/lava/lavatile.jpg' );
  //const noisyTexture = textureLoader.load( '/public/skin/Abstract_Organic_01.jpg' );
  // const noisyTexture = textureLoader.load( 'public/skin/Abstract_Organic_02.jpg' );
  const baseColorTexture = textureLoader.load( 'public/textures/skin/Abstract_Organic_height.jpg' );
  //const baseColorTexture = textureLoader.load( 'public/skin/Abstract_Organic_basecolor.jpg' );

  baseColorTexture.colorSpace = THREE.SRGBColorSpace;

  noisyTexture.wrapS = noisyTexture.wrapT = THREE.RepeatWrapping;
  baseColorTexture.wrapS = baseColorTexture.wrapT = THREE.RepeatWrapping;

  
  //change the values of the uniform so they use the images loaded in
  tiledMaterial.uniforms.texture1.value = noisyTexture;
  tiledMaterial.uniforms.texture2.value = baseColorTexture;
  
  const size = 0.65;
  mesh = new THREE.Mesh( new THREE.TorusGeometry( size, 0.3, 60, 60 ), tiledMaterial );
  mesh.rotation.x = 0.3;
  scene.add( mesh );

  gui = new GUI({name: 'Gui'});
  const mat = gui.addFolder('UV Texture Tiling Scale');
  mat.add(tiledMaterial.uniforms.uvScale.value, 'x', 0, 20);
  mat.add(tiledMaterial.uniforms.uvScale.value, 'y', 0, 20);


  window.addEventListener( 'resize', onWindowResize );

}


function animate() {

  requestAnimationFrame( animate );

  const delta = 5 * clock.getDelta();

  tiledMaterial.uniforms[ 'time' ].value += 0.2 * delta;

  mesh.rotation.y += 0.0125 * delta;
  mesh.rotation.x += 0.05 * delta;

   
  renderer.clear();
  composer.render( 0.01 );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );

}

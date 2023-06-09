import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

/**
 * Base
 */
// GLTF loader
const gltfLoader = new GLTFLoader()

// Debug
const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);

const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/***
 *  Lights
 */
// Ambient Light
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.dampingFactor = 0.04
// controls.minDistance = 5
// controls.maxDistance = 60
// controls.enableRotate = true
// controls.enableZoom = true
// controls.maxPolarAngle = Math.PI /2.5

/**
 * Battery cell
 */

gltfLoader.load(
  'model.glb',
  (gltf) => {

    let model = gltf.scene.children[0]

    let geo = model.geometry.clone()
    let mat = new THREE.MeshNormalMaterial()
    let m = new THREE.Mesh(geo, mat)
    m.position.y =  0.85

    scene.add(m)

    // Created a group to hold all of the cells
    const cellGroup = new THREE.Group();

    // Created a function that will generate cells
    function createBatteryPack() {
      //clearing the scene for new input values
      cellGroup.clear()

      //getting values from user
      const xDim = parseInt(document.getElementById("x-dim").value);
      const yDim = parseInt(document.getElementById("y-dim").value);
      const zDim = parseInt(document.getElementById("z-dim").value);
      const cellSpacing = 0.8;

      // Loop through each cell and position it in the grid(3 loops cause we want to create 3 dimensional grid)
      for (let x = 1; x <= xDim; x++) {
        for (let y = 1; y <= yDim; y++) {
          for (let z = 1; z <= zDim; z++) {
            const cell = new THREE.Mesh(geo, mat);
            scene.remove(m)
            cell.position.set(x * cellSpacing -0.8, y * 1.8 , z * cellSpacing -0.8);
            //rotating the even numbered ones to 180 degree from x axes
            if(z % 2 == 0 && z > 1){
              cell.rotation.x = Math.PI
            }
            cellGroup.add(cell);
          }
        }
      }

      // Add the cell group to the scene
      scene.add(cellGroup);
      //offsetting the group to match like if it is generated from the origin(without this offset the cellGroup will be a little above from the center of the scene)
      cellGroup.position.y = - 0.95
    }

    let btn = document.getElementById('btn')
    btn.addEventListener('click', createBatteryPack)
  }
)

// reset input values
window.onload = function() {
    var inputs = document.getElementsByClassName("input");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = "1";
    }
  };

// Added a grid to help with alignment
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
gridHelper.position.y = -0.5

// created a new axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

/**
 *  Model
 */

// // Texture Loader
// const textureLoader = new THREE.TextureLoader()
// const bakedTexture = textureLoader.load('any.jpg')
// bakedTexture.flipY = false
// bakedTexture.encoding = THREE.sRGBEncoding


// // Material
// const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})

// let model;
// gltfLoader.load(
//     'DeskTop.glb',
//     (gltf) => {

//         //for singular object scene only
//         // gltf.scene.traverse((child) => {
//         //     child.material = bakedMaterial
//         // })

//         // Target's specific object only to apply textures
//         screenMesh = gltf.scene.children.find((child) => {
//             return child.name === 'any'
//         })

//         model = gltf.scene
//         model.scale.set(0.5, 0.5, 0.5) 

//         model = gltf.scene;
//         scene.add(model)
//     }
// )

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x18142c, 1);


/**
 *  Gui 
 */
const params = { color: '#ffffff' };

// add a folder for the scene background color
const folder = pane.addFolder({ title: 'Background Color' });

folder.addInput(params, 'color').on('change', () => {
    const color = new THREE.Color(params.color);
    scene.background = color;
});

// For Tweaking Numbers

// // add a number input to the pane
// const params2 = {value: 1};
// const numberInput = pane.addInput(params2, 'value', {
//   min: 1,
//   max: 5,
//   step: 0.001,
// });

// // update the number value when the input value changes
// numberInput.on('change', () => {
//   console.log(`Number value updated to ${params2.value}`);
// });



/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    fpsGraph.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // if(model){

    //     // group.rotation.y = elapsedTime 
    // }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    fpsGraph.end()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
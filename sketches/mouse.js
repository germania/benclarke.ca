const canvasSketch = require('canvas-sketch');

import * as THREE from 'three';

global.THREE = THREE;
require('three/examples/js/loaders/GLTFLoader');
require('three/examples/js/loaders/EXRLoader');

import mouseVert from './mouse.vert';
import mouseFrag from './mouse.frag';

import distortVert from './distort.vert';
import distortFrag from './distort.frag';

import PingPong from './pingpong';

const settings = {
  animate: true,
  context: 'webgl',
  attributes: {
    antialias: false,
    transparent: false,
    powerPreference: 'high-performance'
  }
};

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    context
  });

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.setClearColor('#000', 1);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  camera.position.z = 2;
  const scene = new THREE.Scene();

  const mouse = {
    prev: new THREE.Vector3(),
    target: new THREE.Vector3(),
    current: new THREE.Vector3()
  };

  const momo = (e) => {
    mouse.target.set(
      e.clientX / window.innerWidth * 2 - 1,
      -(e.clientY / window.innerHeight * 2 - 1)
    );
  };

  window.addEventListener('pointermove', momo);

  const geo = new THREE.PlaneBufferGeometry(2, 2);
  const osMat = new THREE.ShaderMaterial({
    vertexShader: mouseVert,
    fragmentShader: mouseFrag,
    uniforms: {
      uPrevMouse: {
        value: mouse.prev
      },
      uMouse: {
        value: mouse.current
      },
      uBackground: {
        value: null
      },
      uAspect: {
        value: 1.0
      }
    }
  });

  const mat = new THREE.ShaderMaterial({
    depthTest: false,
    vertexShader: distortVert,
    fragmentShader: distortFrag,
    uniforms: {
      uTexture: {
        value: new THREE.TextureLoader().load('./nebula.jpg')
      },
      uMouse: {
        value: null
      }
    }
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  scene.add(mesh);

  const b = new THREE.Group();
  b.renderOrder = 2;
  scene.add(b);

  const light = new THREE.DirectionalLight(0xaaaaaa, 1);
  light.position.set(2, 2, 2);
  scene.add(light);
  light.target = b;

  const gltfLoader = new THREE.GLTFLoader();
  const meshMat = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: 0.6,
    metalness: 0.0,
    roughness: 0.05,
    ior: 1.2,
    reflectivity: 0.7,
    // flatShading: true,
    color: 0xc0c6ca
  });

  gltfLoader.load('./b.glb', (model) => {
    const obj = model.scene.children[0];
    obj.scale.setScalar(0.5);
    obj.material = meshMat;
    b.add(obj);
  });

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  let exrBackground;
  new THREE.EXRLoader().load('./env-map.exr', (tex) => {
    const exrRT = pmremGenerator.fromEquirectangular(tex);
    exrBackground = exrRT.texture;
    scene.background = exrBackground;
    scene.environment = exrBackground;
    tex.dispose();
  });

  const osScene = new THREE.Scene();
  const osCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  osCamera.position.z = 1;
  const osMesh = new THREE.Mesh(geo, osMat);
  osScene.add(osMesh);

  const doRender = (read, write) => {
    osMat.uniforms.uBackground.value = read.texture;
    mat.uniforms.uMouse.value = read.texture;

    renderer.setRenderTarget(write);
    renderer.clear();
    renderer.render(osScene, osCamera);
    renderer.setRenderTarget(null);
  };

  const pingpong = PingPong(doRender, [ 128, 128 ], {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
  });

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();

      osMat.uniforms.uAspect.value = camera.aspect;
      
      const frustum = 2 * Math.abs(camera.position.z) * Math.tan(camera.fov * 0.5 * Math.PI / 180);
      mesh.scale.y = frustum * 0.5;
      mesh.scale.x = frustum * camera.aspect * 0.5;

    },

    render({ time, deltaTime }) {
      mouse.prev.copy(mouse.current);
      mouse.current.lerp(mouse.target, 0.1);

      pingpong.render();
      // renderer.render(osScene, osCamera);
      renderer.render(scene, camera);
      
      b.rotation.y = mouse.current.x * Math.PI * 0.15;
      b.rotation.x = mouse.current.y * Math.PI * -0.15;

    },

    unload() {
      renderer.dispose();
      window.removeEventListener('pointermove', momo);
    }
  };
};

canvasSketch(sketch, settings);

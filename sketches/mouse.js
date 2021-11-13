const canvasSketch = require('canvas-sketch');

import * as THREE from 'three';

import mouseVert from './mouse.vert';
import mouseFrag from './mouse.frag';

import distortVert from './distort.vert';
import distortFrag from './distort.frag';

import PingPong from './pingpong';

const settings = {
  animate: true,
  context: 'webgl',
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    context
  });

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
      e.clientX / window.innerWidth - 0.5,
      -(e.clientY / window.innerHeight - 0.5)
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
      }
    }
  });

  const mat = new THREE.ShaderMaterial({
    vertexShader: distortVert,
    fragmentShader: distortFrag,
    uniforms: {
      uTexture: {
        value: new THREE.TextureLoader().load('./trees.jpg')
      },
      uMouse: {
        value: null
      }
    }
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const osScene = new THREE.Scene();
  const osCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  osCamera.position.z = 1;
  const osMesh = new THREE.Mesh(geo, osMat);
  osScene.add(osMesh);

  const doRender = (read, write) => {
    osMat.uniforms.uBackground.value = read.texture;
    renderer.setRenderTarget(write);
    renderer.render(osScene, osCamera);
    renderer.setRenderTarget(null);

    mat.uniforms.uMouse.value = write.texture;
  };

  const pingpong = PingPong(doRender, [ 1024, 1024 ], {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
  });

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },

    render({ time, deltaTime }) {
      mouse.prev.copy(mouse.current);
      mouse.current.lerp(mouse.target, 0.1);
      pingpong.render();
      renderer.render(scene, camera);
    },

    unload() {
      renderer.dispose();
      window.removeEventListener('pointermove', momo);
    }
  };
};

canvasSketch(sketch, settings);

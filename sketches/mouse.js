const canvasSketch = require('canvas-sketch');

global.THREE = require('three');

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
  const scene = new THREE.Scene();

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },

    render({ time, deltaTime }) {
      renderer.render(scene, camera);
    },

    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

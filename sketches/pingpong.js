import * as THREE from 'three';

const PingPong = (callback, [ w, h ], options) => {

	const bufA = new THREE.WebGLRenderTarget(w, h, options);
	const bufB = new THREE.WebGLRenderTarget(w, h, options);

	let read = bufB;
	let write = bufA;

	const init = (renderer) => {
		renderer.setRenderTarget(bufA);
		renderer.clear(true);

		renderer.setRenderTarget(bufB);
		renderer.clear(true);

		renderer.setRenderTarget(null);
	};

	const render = () => {
		callback(read, write);
		const tmp = read;
		read = write;
		write = tmp;
	};

	return {
		init,
		render
	};

};

export default PingPong;
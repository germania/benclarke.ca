import * as THREE from 'three';

const PingPong = (callback, [ w, h ], options) => {

	const bufA = new THREE.WebGLRenderTarget(w, h, options);
	const bufB = new THREE.WebGLRenderTarget(w, h, options);

	let read = bufB;
	let write = bufA;

	const render = () => {
		callback(read, write);
		const tmp = read;
		read = write;
		write = tmp;
	};

	return {
		render
	};

};

export default PingPong;
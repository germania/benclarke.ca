varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uMouse;

void main() {

	vec4 tex = texture2D(uMouse, vUv);
	vec2 uv = vUv + tex.xy * tex.z * 0.3;

	vec4 color = texture2D(uTexture, uv) + tex * 0.5;

	gl_FragColor = color;

}
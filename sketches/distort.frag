varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uMouse;

void main() {
	
	vec4 tex = texture2D(uMouse, vUv);
	float distort = 1.0 + (tex.r * 0.05);

	vec2 uv = vUv * distort;
	vec4 color = texture2D(uTexture, uv);

	gl_FragColor = color;

}
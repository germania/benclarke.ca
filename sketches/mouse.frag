varying vec2 vUv;

uniform vec3 uMouse;
uniform vec3 uPrevMouse;

uniform sampler2D uBackground;

void main() {

	vec4 bg = texture2D(uBackground, vUv);

	vec2 uv = vUv - 0.5;
	float dist = 1.0 - length(uv - uMouse.xy);
	float size = 1.0 - length(uMouse - uPrevMouse);

	vec4 color = mix(bg, vec4(0.0, 0.0, 0.0, 1.0), 0.05) + vec4(step(size, dist), 0.0, 0.0, 1.0);
	color = clamp(color, vec4(0.0, 0.0, 0.0, 0.0), vec4(1.0, 1.0, 1.0, 1.0));

	gl_FragColor = color;
}
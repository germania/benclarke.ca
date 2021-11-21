varying vec2 vUv;

uniform vec3 uMouse;
uniform vec3 uPrevMouse;

uniform sampler2D uBackground;

void main() {

	vec4 color = texture2D(uBackground, vUv);
	vec2 uv = vUv * 2.0 - 1.0;

	vec2 mouse = uv - uMouse.xy;
	vec2 prevMouse = uv - uPrevMouse.xy;
	vec2 velocity = (mouse - prevMouse) * 10.0;
	float size = min(0.2, length(mouse - prevMouse) * 3.0);

	vec3 stamp = vec3(velocity, pow(1.0 - min(1.0, length(velocity)), 0.1));
	float falloff = smoothstep(size, 0.0, length(mouse));
	color.rgb = mix(color.rgb * 0.98, stamp, vec3(falloff));

	gl_FragColor = color;
}
precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float uProgress;
uniform float uXaspect;
uniform float uYaspect;
uniform vec2 uResolution;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uNoise;

const vec3 HASHSCALE3 = vec3(0.1031, 0.1030, 0.0973);

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.);
  return mix(m, 2.0 - m, step(1.0, m));
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
  0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
  -0.577350269189626, // -1.0 + 2.0 * C.x
  0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m *= m;
  m *= m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {

  vec2 newUv = gl_FragCoord.xy / uResolution.xy;

  newUv = newUv - vec2(0.5);
  newUv.x *= min(uXaspect, 1.);
  newUv.y *= min(uYaspect, 1.);
  newUv += 0.5;

  float p = fract(uProgress);

  // vec2 hash = hash22(newUv);
  vec2 hash = newUv;
  float snoise = snoise(newUv);

  vec4 noise = texture2D(uNoise, hash + vec2(snoise * 2.0 * sin(uTime), snoise * 2.0 * sin(uTime)));

  float uvX = vUv.x;
  p = step(0.0, (p + uvX - 1.0));

  vec4 texture0 = texture2D(uTexture0, newUv + noise.r * 0.02);
  vec4 texture1 = texture2D(uTexture1, newUv + noise.r * 0.02);

  vec4 finalColor0 = mix(texture0, texture1, p);
  vec4 finalColor1 = mix(texture0, texture1, p);

  vec4 color = mix(finalColor0, finalColor1, p);

  gl_FragColor = color;

}
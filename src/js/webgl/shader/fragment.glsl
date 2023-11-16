precision mediump float;

varying vec2 vUv;

uniform float uProgress;
uniform float uXaspect;
uniform float uYaspect;
uniform vec2 uResolution;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uNoise;

mat2 getRotM(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

const float PI = 3.1415;
const float angle1 = PI * 0.25;
const float angle2 = -PI * 0.75;

void main() {

  vec2 newUv = vUv;

  newUv = newUv - vec2(0.5);
  newUv.x *= min(uXaspect, 1.);
  newUv.y *= min(uYaspect, 1.);
  newUv += 0.5;

  float p = fract(uProgress);
  float intensity = 0.02;

  vec4 disp = texture2D(uNoise, newUv);
  vec2 dispVec = vec2(disp.r, disp.g);

  vec2 distortedPosition1 = newUv + getRotM(angle1) * dispVec * intensity * p;
  vec4 t1 = texture2D(uTexture0, distortedPosition1);

  vec2 distortedPosition2 = newUv + getRotM(angle2) * dispVec * intensity * (1.0 - p);
  vec4 t2 = texture2D(uTexture1, distortedPosition2);

  gl_FragColor = mix(t1, t2, p);
}
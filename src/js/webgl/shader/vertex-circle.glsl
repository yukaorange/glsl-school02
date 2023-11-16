precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float progress;
uniform float uXaspect;
uniform float uYaspect;

varying vec2 vUv;

const float PI = 3.1415926535897932384626433832795;
const float innerR = 1. / 5.;
const float outerR = 2. / 5.;

void main() {
  vec3 pos = position;
  vUv = uv;

  pos = pos + 1.0 / 2.0;

  float angle = pos.x * 2.0 * PI + PI / 2.0;
  float radius = mix(innerR, outerR, pos.y);

  
  pos.x = radius * cos(angle);
  pos.y = radius * sin(angle);
  pos.z = 0.0;


  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}
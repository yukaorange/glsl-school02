precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vec3 pos = position;

  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
  // gl_Position = vec4(pos, 1.0);
}
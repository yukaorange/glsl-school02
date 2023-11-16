precision mediump float;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vec3 pos = position;

  vUv = uv;

  gl_Position = vec4(pos, 1.0);
}
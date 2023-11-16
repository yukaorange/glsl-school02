precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture0;

void main() {
  vec2 newUv = vUv;

  vec4 texture = texture2D(uTexture0, newUv);

  newUv.x -= 0.002;

  texture.r = texture2D(uTexture0, newUv).r;

  newUv.x += 0.002;

  texture.g = texture2D(uTexture0, newUv).g;

  newUv.x -= 0.002;

  texture.b = texture2D(uTexture0, newUv).b;

  gl_FragColor = texture;
}
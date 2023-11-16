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

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.);
  return mix(m, 2.0 - m, step(1.0, m));
}

void main() {

  vec2 newUv = gl_FragCoord.xy / uResolution.xy;

  newUv = newUv - vec2(0.5);
  newUv.x *= min(uXaspect, 1.);
  newUv.y *= min(uYaspect, 1.);
  newUv += 0.5;

  float p = fract(uProgress);

  vec4 noise = texture2D(uNoise, mirrored(newUv + uTime * 0.04));

  float uvX = vUv.x;
  p = step(0.0, (p + uvX - 1.0));
  p = p + noise.r * 0.01;

  vec4 texture0 = texture2D(uTexture0, newUv + noise.r * 0.01);
  vec4 texture1 = texture2D(uTexture1, newUv + noise.r * 0.01);

  vec4 finalColor0 = mix(texture0, texture1, p);
  vec4 finalColor1 = mix(texture0, texture1, p);

  vec4 color = mix(finalColor0, finalColor1, p);

  gl_FragColor = color;

}
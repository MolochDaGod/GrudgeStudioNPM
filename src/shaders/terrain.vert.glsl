uniform float uTime;
uniform float uScale;
uniform float uHeight;
uniform float uFrequency;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float simplexNoise2d(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getElevation(vec2 pos) {
  float elevation = 0.0;
  float frequency = uFrequency;
  float amplitude = 1.0;
  
  for(int i = 0; i < 4; i++) {
    elevation += simplexNoise2d(pos * frequency + uTime * 0.1) * amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return elevation * uHeight;
}

void main() {
  vUv = uv;
  
  vec3 pos = position * uScale;
  float elevation = getElevation(pos.xz);
  pos.y += elevation;
  vElevation = elevation;
  
  float delta = 0.01;
  float elevationX = getElevation(pos.xz + vec2(delta, 0.0));
  float elevationZ = getElevation(pos.xz + vec2(0.0, delta));
  vec3 tangent = normalize(vec3(delta, elevationX - elevation, 0.0));
  vec3 bitangent = normalize(vec3(0.0, elevationZ - elevation, delta));
  vNormal = normalize(cross(bitangent, tangent));
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

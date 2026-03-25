uniform float uHeight;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;

void main() {
  float normalizedElevation = (vElevation / uHeight + 1.0) * 0.5;
  
  vec3 lowColor = vec3(0.15, 0.25, 0.1);
  vec3 midColor = vec3(0.3, 0.35, 0.2);
  vec3 highColor = vec3(0.5, 0.45, 0.35);
  vec3 peakColor = vec3(0.9, 0.9, 0.95);
  
  vec3 terrainColor;
  if(normalizedElevation < 0.25) {
    terrainColor = mix(lowColor, midColor, normalizedElevation * 4.0);
  } else if(normalizedElevation < 0.5) {
    terrainColor = mix(midColor, highColor, (normalizedElevation - 0.25) * 4.0);
  } else if(normalizedElevation < 0.75) {
    terrainColor = mix(highColor, peakColor, (normalizedElevation - 0.5) * 4.0);
  } else {
    terrainColor = peakColor;
  }
  
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  float ambient = 0.3;
  
  vec3 finalColor = terrainColor * (ambient + diffuse * 0.7);
  
  gl_FragColor = vec4(finalColor, 1.0);
}

const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("WebGL 2.0 is not supported by your browser.");
}

// Vertex Shader: full-screen triangle
const vsSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment Shader with your code snippet
const fsSource = `#version 300 es
precision highp float;

out vec4 o;

uniform vec2 r;
uniform float t;

#define FC gl_FragCoord
#define PI 3.141592653589793
#define s 0.0

float fsnoise(vec2 v) {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 p;
  float D, e, i, b, R;
  for(p.z = 5.; i++ < 6e2; mod(i, 36.) == s ? o += .1 / exp(e * 1e3), p -= (.5 - FC.rgb / r.y) * e++ : p)
    R = fsnoise(p.xy * i) * 2. - 1.,
    D = length(p - vec3(sin(R = b + R * R * R * PI) + 2. * sin(R + R), cos(R) - 2. * cos(R + R), -sin(3. * R))) - sin(R * 36. + t * 9.) * .1,
    --D < e ? e = D, b = R : e;
  
  o.a = 1.0;
}
`;

// Compile shader helper
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Create WebGL program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}

// Quad geometry for rendering
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1.0, -1.0,
     3.0, -1.0,
    -1.0,  3.0
  ]),
  gl.STATIC_DRAW
);

const positionLocation = gl.getAttribLocation(program, "position");
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Uniform locations
const resLoc = gl.getUniformLocation(program, "r");
const timeLoc = gl.getUniformLocation(program, "t");

// Resize canvas handling
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = Math.floor(canvas.clientWidth * dpr);
  const displayHeight = Math.floor(canvas.clientHeight * dpr);

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
}

// Render loop
function render(time) {
  resize();

  gl.useProgram(program);
  gl.bindVertexArray(vao);

  gl.uniform2f(resLoc, canvas.width, canvas.height);
  gl.uniform1f(timeLoc, time * 0.001); // time in seconds

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

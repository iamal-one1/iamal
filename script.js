
var vertexShaderSource = `#version 300 es
  in vec2 a_position;
 
  uniform vec2 u_resolution;
 
  void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
 
    gl_Position = vec4(clipSpace, 0, 1);
  }` ;

// `#version 300 es
 
// // an attribute is an input (in) to a vertex shader.
// // It will receive data from a buffer
// in vec4 a_position;
 
// // all shaders have a main function
// void main() {
 
//   // gl_Position is a special variable a vertex shader
//   // is responsible for setting
//   gl_Position = a_position;
// }
// `;

var fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;
 
uniform vec4 u_color ;

// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant redish-purple
  // outColor = vec4(1, 0, 0.5, 1);
  outColor = u_color ;
}
`;

function randomInt(range) {
	return Math.floor(Math.random() * range) ;
}

function setRectangle(gl, x, y, width, height) {
	var x1 = x ;
	var x2 = x + width ;
	var y1 = y ;
	var y2 = y + height ;

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x1, y1,
		x2, y1,
		x1, y2,
		x1, y2,
		x2, y1,
		x2, y2]), gl.STATIC_DRAW) ;
}

function createShader(gl, type, source) {
	var shader = gl.createShader(type) ;
	gl.shaderSource(shader, source) ;
	gl.compileShader(shader) ;
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS) ;
	if(success) {
		return shader ;
	}

	console.log(gl.getShaderInfoLog(shader)) ;
	gl.deleteShader(shader) ;
}

function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram() ;
	gl.attachShader(program, vertexShader) ;
	gl.attachShader(program, fragmentShader) ;
	gl.linkProgram(program) ;
	var success = gl.getProgramParameter(program, gl.LINK_STATUS) ;
	if(success) {
		return program ;
	}

	console.log(gl.getProgramInfoLog(program)) ;
	gl.deleteProgram(program) ;
}

function main() {


	var canvas = document.getElementById("c") ;
	canvas.width = 400 ;
	canvas.height = 300 ;
	console.log(canvas) ;

	var gl = canvas.getContext("webgl2") ;
	if(!gl) {
		console.log('no webgl2 for you!') ;
	}

	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource) ;
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource) ;

	var program = createProgram(gl, vertexShader, fragmentShader) ;

	var positionAttributeLocation = gl.getAttribLocation(program, "a_position") ;
	var positionBuffer = gl.createBuffer() ;

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer) ;
	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

	// var positions = [
	// 	0, 0,
	// 	0, 0.5,
	// 	0.7, 0
	// ] ;

	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW) ;

	var positions = [
	  10, 20,
	  80, 20,
	  10, 30,
	  10, 30,
	  80, 20,
	  80, 30,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	var vao = gl.createVertexArray() ;
	gl.bindVertexArray(vao) ;
	gl.enableVertexAttribArray(positionAttributeLocation) ;

	var size = 2 ;
	var type = gl.FLOAT ;
	var normalize = false ;
	var stride = 0 ;
	var offset = 0 ;
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset) ;


	// webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(program);
	gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
	gl.bindVertexArray(vao);

	// var primitiveType = gl.TRIANGLES;
	// var offset = 0;
	// var count = 6;
	// gl.drawArrays(primitiveType, offset, count);

	var colorLocation = gl.getUniformLocation(program, "u_color");
 
  	// draw 50 random rectangles in random colors
  	for (var ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    	setRectangle(
        	gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
 
    // Set a random color.
    	gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
 
    // Draw the rectangle.
    	var primitiveType = gl.TRIANGLES;
    	var offset = 0;
    	var count = 6;
    	gl.drawArrays(primitiveType, offset, count);
  	}

}

main() ;
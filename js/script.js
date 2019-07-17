
var vertexShaderSource = `#version 300 es
  in vec2 a_position;

  uniform mat3 u_matrix ;
  out vec4 v_color ;
  
  void main() {
	gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1) ;
	
	v_color = gl_Position * 0.5 + 0.5 ;
  }` ;


var fragmentShaderSource = `#version 300 es

precision mediump float;
 
in vec4 v_color;

out vec4 outColor;
 
void main() {
  outColor = v_color ;
}`;

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

function setGeometry(gl) {
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			   200, -200,
			 150,  125,
			-175,  100]),
		gl.STATIC_DRAW);
}



function main() {
	var canvas = document.getElementById("c") ;
	canvas.width = window.innerWidth ;
	canvas.height = window.innerHeight ;
	console.log(canvas) ;

	var gl = canvas.getContext("webgl2") ;
	if(!gl) {
		console.log('no webgl2 for you!') ;
	}

	var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

	var positionLocation = gl.getAttribLocation(program, "a_position");

	var matrixLocation = gl.getUniformLocation(program, "u_matrix");

	var vao = gl.createVertexArray();
	  gl.bindVertexArray(vao);
	  
	var buffer = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	  
	  setRectangle(gl, -200, -200, canvas.width, canvas.height);

	  gl.enableVertexAttribArray(positionLocation);
	  var size = 2;
	  var type = gl.FLOAT;
	  var normalize = false;
	  var stride = 0;
	  var offset = 0;
	  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
	
	  var translation = [200, 150];
	  var angleInRadians = 0;
	  var scale = [1, 1];
	
	  drawScene();
	
	  // Setup a ui.
	  webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
	  webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
	  webglLessonsUI.setupSlider("#angle",  {slide: updateAngle, max: 360});
	  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
	  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

	  function drawScene() {
		webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
		// Clear the canvas
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		// Compute the matrix
		var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
		matrix = m3.translate(matrix, translation[0], translation[1]);
		matrix = m3.rotate(matrix, angleInRadians);
		matrix = m3.scale(matrix, scale[0], scale[1]);
	
		// Tell it to use our program (pair of shaders)
		gl.useProgram(program);
	
		// Bind the attribute/buffer set we want.
		gl.bindVertexArray(vao);
	
		// Set the matrix.
		gl.uniformMatrix3fv(matrixLocation, false, matrix);
	
		// Draw the geometry.
		var offset = 0;
		var count = 3;
		gl.drawArrays(gl.TRIANGLES, offset, count);
	}
	
	function updatePosition(index) {
		return function(event, ui) {
		  translation[index] = ui.value;
		  drawScene();
		};
	  }
	
	  function updateAngle(event, ui) {
		var angleInDegrees = 360 - ui.value;
		angleInRadians = angleInDegrees * Math.PI / 180;
		drawScene();
	  }
	
	  function updateScale(index) {
		return function(event, ui) {
		  scale[index] = ui.value;
		  drawScene();
		};
	  }

	// var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource) ;
	// var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource) ;

	// var program = createProgram(gl, vertexShader, fragmentShader) ;

	// var positionAttributeLocation = gl.getAttribLocation(program, "a_position") ;
	// var positionBuffer = gl.createBuffer() ;

	// gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer) ;
	// var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

	// // var positions = [
	// // 	0, 0,
	// // 	0, 0.5,
	// // 	0.7, 0
	// // ] ;

	// // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW) ;

	// var positions = [
	//   10, 20,
	//   80, 20,
	//   10, 30,
	//   10, 30,
	//   80, 20,
	//   80, 30,
	// ];
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// var vao = gl.createVertexArray() ;
	// gl.bindVertexArray(vao) ;
	// gl.enableVertexAttribArray(positionAttributeLocation) ;

	// var size = 2 ;
	// var type = gl.FLOAT ;
	// var normalize = false ;
	// var stride = 0 ;
	// var offset = 0 ;
	// gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset) ;


	// // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// gl.clearColor(0, 0, 0, 0);
	// gl.clear(gl.COLOR_BUFFER_BIT);
	// gl.useProgram(program);
	// gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
	// gl.bindVertexArray(vao);

	// // var primitiveType = gl.TRIANGLES;
	// // var offset = 0;
	// // var count = 6;
	// // gl.drawArrays(primitiveType, offset, count);

	// var colorLocation = gl.getUniformLocation(program, "u_color");
 
  	// // draw 50 random rectangles in random colors
  	// for (var ii = 0; ii < 50; ++ii) {
    // // Setup a random rectangle
    // 	setRectangle(
    //     	gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
 
    // // Set a random color.
    // 	gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
 
    // // Draw the rectangle.
    // 	var primitiveType = gl.TRIANGLES;
    // 	var offset = 0;
    // 	var count = 6;
    // 	gl.drawArrays(primitiveType, offset, count);
  	// }

}

main() ;
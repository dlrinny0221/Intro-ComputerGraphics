var canvas;
var gl;
var program;
var pProgram;

var points = [];
var colors = [];
var pColors = [];
var pPoints = [];

var NumTimesToSubdivide = 2;

var vertices = [
        vec3(  0.0000,  0.0000,  1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];

var axis = 0;
var rTheta = [ 0, 0, 0 ];
var thetaLoc;

var prevX;
var prevY;
var prevZ;

var near = 0.1;
var far = 100.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

// camera KEY
var wKey = false;
var sKey = false;
var aKey = false;
var dKey = false;
var rKey = false;
var fKey = false;

// obj KEY
var iKey = false;
var kKey = false;
var jKey = false;
var lKey = false;

var mvMatrix, pMatrix;
var modelView, projection;
var pModelView, pProjection;

var eye = vec3( 0.0, 0.0, 5.0 );
var at = vec3( eye[0] + radius*Math.sin(theta)*Math.cos(phi), 
    		   eye[1] + radius*Math.sin(phi), 
    		   eye[2] - radius*Math.cos(theta)*Math.cos(phi)
    		   );

var up = vec3(0.0, 1.0, 0.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //Gasket Verticies
    
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
    
    // draw checkerboard plane             
    drawPlane();
    
    // Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;
    gl.clearColor(0.529, 0.878, 0.980, 1.0); //135,206,250
    gl.enable(gl.DEPTH_TEST);
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    pProgram = initShaders(gl, "pVertex-shader", "fragment-shader");
    thetaLoc = gl.getUniformLocation(program, "rTheta");
    
    //event handlers
    document.getElementById("RESET").onclick = function () {
    	colors = [];
        points = [];
        pPoints = [];
        pColors = [];
		
		axis = 0;
		rTheta = [ 0, 0, 0 ]; 
		eye = vec3( 0.0, 0.0, 5.0 );
		theta  = 0.0;
		phi    = 0.0;
		at = vec3( eye[0] + radius * Math.sin(theta)*Math.cos(phi), 
    		       eye[1] + radius * Math.sin(phi), 
    		       eye[2] - radius * Math.cos(theta)*Math.cos(phi)
    		     );
    		   
    	fovy = 45.0;
        vertices = [
	        vec3(  0.0000,  0.0000,  1.0000 ),
	        vec3(  0.0000,  0.9428,  0.3333 ),
	        vec3( -0.8165, -0.4714,  0.3333 ),
	        vec3(  0.8165, -0.4714,  0.3333 )  
	    ];
        divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
        drawPlane();
    };
    
    document.getElementById("slider").onchange = function(event) {
    	NumTimesToSubdivide = event.target.value;
        points = [];
        colors = [];
        divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
    };
    
    document.getElementById( "R1" ).onclick = function(){ rTheta[0] += 2.0; };
    document.getElementById( "R2" ).onclick = function(){ rTheta[1] += 2.0; };
    document.getElementById( "R3" ).onclick = function(){ rTheta[2] += 2.0; };
    
    document.getElementById( "Randomize" ).onclick = function () {
    	pPoints = [];
        drawPlaneT();
    };
    
    document.getElementById( "Hawaii" ).onclick = function () {
    	pPoints = [];
        hawaiiPlane();
    };
    
    document.getElementById( "FOVinc" ).onclick = function(){ if(fovy < 180) fovy += 2.0; };
    document.getElementById( "FOVdec" ).onclick = function(){ if(fovy > 0 ) fovy -= 2.0; };
    
    window.onkeydown = function(event){
    	var key = String.fromCharCode(event.keyCode);
    	
    	switch(key){
    		/* CAMERA */
    		case 'W' : wKey = true; break;
    		case 'S' : sKey = true; break;
    		case 'A' : aKey = true; break;
    		case 'D' : dKey = true; break;
    		case 'R' : rKey = true; break;
    		case 'F' : fKey = true; break;
    		
    		/* OBJECT */
    		case 'I' : iKey = true; break;
    		case 'K' : kKey = true; break;
    		case 'J' : jKey = true;	break;
    		case 'L' : lKey = true; break;
    		/*case 'E' : eyeAt();
					   camRotate();
   					   break;*/
    	}
    };
    
    window.onkeyup = function(event){
    	var key = String.fromCharCode(event.keyCode);
    	switch(key){
    		/* CAMERA */
    		case 'W' : wKey = false; break;
    		case 'S' : sKey = false; break;
    		case 'A' : aKey = false; break;
    		case 'D' : dKey = false; break;
    		case 'R' : rKey = false; break;
    		case 'F' : fKey = false; break;
    		
    		/* OBJECT */
    		case 'I' : iKey = false; break;
    		case 'K' : kKey = false; break;
    		case 'J' : jKey = false; break;
    		case 'L' : lKey = false; break;
    		}
    	}
    
    canvas.addEventListener("mousedown", function(event){
    	prevX = event.pageX;
    	prevY = event.pageY;
    }, false);
    
    canvas.addEventListener("mousemove", function(event){
    	var currX = event.pageX;
		var currY = event.pageY;
		//console.log(event.which);
    	if(event.which == 1){
    		if(event.shiftKey ){
    			eyeAt();
    			//if()
	    		theta +=  (currX - prevX)/100;
	    		phi += -(currY - prevY)/100;
	    		if(phi < - 1.5 || phi > 1.5 ) phi -= -(currY - prevY)/100;
	    	}
    		for(var i = 0; i < vertices.length; i++){
	    		vertices[i][0] += (currX - prevX)/100;
	    		vertices[i][1] += -(currY - prevY)/100;
    		}
    		points = []; colors = [];
    		divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
	    	prevX = currX;
	    	prevY = currY;
    	}
    	if(event.which == 2){
    		var currRX = event.pageX;
    		var currRY = event.pageY;
    		rTheta[0] += -(currRY - prevY)/10;
    		rTheta[1] += (currRX - prevX)/10;
        	prevX = currRX;
        	prevY = currRY;
    	}
    }, false);
    
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    pModelView = gl.getUniformLocation( pProgram, "modelView" );
    pProjection = gl.getUniformLocation( pProgram, "projection" );
	
    render();
};

function refresh(){
    
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}


function eyeAt(){
	at[0] = eye[0] + radius * Math.sin(theta) * Math.cos(phi);
	at[1] = eye[1] + radius                   * Math.sin(phi);
	at[2] = eye[2] - radius * Math.cos(theta) * Math.cos(phi);
}

/*function camRotate(){
	theta -= 0.1;
	phi += 0.1
}*/

function moveObj(){
	var translate = 0.1;
	if( iKey ){
		for(var i = 0; i < vertices.length; i++) vertices[i][1] += translate;
	}
	if( kKey ){
		for(var j = 0; j < vertices.length; j++) vertices[j][1] -= translate;
	}
	if( jKey ){
		for(var k = 0; k < vertices.length; k++) vertices[k][0] -=translate;
	}
	if( lKey ){
		for(var m = 0; m < vertices.length; m++) vertices[m][0] +=translate;
	}
	if(iKey || kKey || jKey || lKey ){
		points = [];
   		divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
	}
}

function moveCamera(){
	if(wKey == true){
		eye[0] -= Math.sin(theta) / 10;
    	eye[2] -= Math.cos(theta) / 10;
	}
	if(sKey == true){
		eye[0] += Math.sin(theta) / 10;
    	eye[2] += Math.cos(theta) / 10;
	}
	if(aKey == true){
		eye[0] -= Math.cos(theta) / 10;
    	eye[2] -= Math.sin(theta) / 10;
	}
	if(dKey == true){
		eye[0] += Math.cos(theta) / 10;
    	eye[2] += Math.sin(theta) / 10;
	}
	if(rKey == true){
    	eye[1] += 0.1;
	}
	if(fKey == true){
    	eye[1] -= 0.1;
	}
	eyeAt();
}

function drawSquare(w, x, y, z, color){
	planeTri(w, x, y, color);
	planeTri(w, y, z, color);
}

function drawPlaneT(){
	var pH = -2.0; // plane height
	var pHRandom = [];
	for(var p = 0; p < 21; p++){
		pHRandom[p] = [];
		for(var q = 0; q < 21; q++){
			pHRandom[p][q] = (Math.random() - 0.5)/2;
		}
	}
	for(var i = -10.0; i < 10.0; i++){
		for(var j = 10.0; j > -10.0; j--){
			drawSquare(
				vec3(i, pH + pHRandom[i+10][j+20], j ),
				vec3(i+1, pH + pHRandom[i+11][j+20], j ),
				vec3(i+1, pH + pHRandom[i+11][j+21], j+1 ),
				vec3(i, pH + pHRandom[i+10][j+21], j+1 ),
				(i+j)%2+1
			);
			
		}
			
	}
}

function hawaiiPlane(){
	var pH = -2.0; // plane height
	var phHawaii = [];
	var k = 0;
	for(var p = 0; p < 256; p++){
		phHawaii[p] = [];
		for(var q = 0; q < 256; q++){
			phHawaii[p][q] = data[k] ;
			k += 1;
		}
		//k += 1;
	}
	
	for(var i = -64.0; i < 64.0; i++){
		for(var j = 64.0; j > -64.0; j--){
			drawSquare(
				vec3(i, pH + phHawaii[(i+64) * 2][(j+64) * 2] / 40, j ),
				vec3(i+1, pH + phHawaii[(i+65) * 2][(j+64) * 2] / 40, j ),
				vec3(i+1, pH + phHawaii[(i+65) * 2][(j+65) * 2] / 40, j+1 ),
				vec3(i, pH + phHawaii[(i+64) * 2][(j+65) * 2] / 40, j+1 ),
				(i+j)%2+1
			);
		}
			
	}
}


function drawPlane(){
	var pH = -2.0; // plane height
	for(var i = -10.0; i < 10; i++){
		for(var j = 10.0; j > -10.0; j--){
			drawSquare(
				vec3(i, pH , j ),
				vec3(i+1, pH , j ),
				vec3(i+1, pH , j+1 ),
				vec3(i, pH , j+1 ),
				(i+j)%2+1
			);
		}
	}
}

function planeTri(d, e, f, color){
	var baseC = [
        vec3(0.0, 0.0, 0.0),
        vec3(0.1, 0.5, 0.5),
        vec3(0.0, 0.0, 0.0)   // plane: black tile when i=0, j=0;
    ];
    
    pColors.push( baseC[color]);
    pPoints.push( d );
    pColors.push( baseC[color]);
    pPoints.push( e );
    pColors.push( baseC[color]);
    pPoints.push( f );
    
}

function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d ){
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count ){
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function render() {
    mvMatrix = lookAt(eye, at , up);
    pMatrix = perspective(fovy, aspect, near, far);
    moveCamera();
    moveObj();
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    
	gl.uniform3fv(thetaLoc, rTheta);
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
    
    // new vertex-shader
    gl.useProgram( pProgram );
    
    // NEW BUFFER FOR PLANE
    var pcBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, pcBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pColors), gl.STATIC_DRAW );
    
    var pColor = gl.getAttribLocation( pProgram, "pColor" );
    gl.vertexAttribPointer( pColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( pColor );
    
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pPoints), gl.STATIC_DRAW );
    
    var pPosition = gl.getAttribLocation( pProgram, "pPosition" );
    gl.vertexAttribPointer( pPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( pPosition );

    gl.uniformMatrix4fv( pModelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pProjection, false, flatten(pMatrix) );
	
    gl.drawArrays( gl.TRIANGLES, 0, pPoints.length );

    requestAnimFrame( render );
}

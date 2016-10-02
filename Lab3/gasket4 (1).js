
var canvas;
var gl;
var program;
var pProgram;

var points = [];
var colors = [];
var pColors = [];
var pPoints = [];

var NumTimesToSubdivide = 2;
// var numVertices = 50;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

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

var mvMatrix, pMatrix;
var modelView, projection;
var pModelView, pProjection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the vertices of our 3D gasket
    // Four vertices on unit circle
    // Intial tetrahedron with equal length sides
    
    var vertices = [
    /*
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  1.0,  0.5 ), // top vertex
        vec3( -1, -0.5,  0.5 ),
        vec3(  1, -0.5,  0.5 )
        */
       
        vec3(  0.0000,  0.0000,  1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
        
    ];
    
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
    
    // draw checkerboard plane             
    drawPlane();

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor(0.529, 0.878, 0.980, 1.0); //135,206,250
    
    //var camera = MV.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    //perspective(45, gl.viewerWidth / gl.viewerHeight, 0.1, 100.0, pMatrix);
    
    // enable hidden-surface removal
    
    gl.enable(gl.DEPTH_TEST);
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    pProgram = initShaders(gl, "pVertex-shader", "fragment-shader");
    
    //thetaLoc = gl.getUniformLocation(program, "theta");
    thetaLoc = gl.getUniformLocation(program, "rTheta");
    
    refresh();
    
    document.getElementById("RESET").onclick = function () {
    	colors = [];
        points = [];
        xAxis = 0;
		yAxis = 1;
		zAxis = 2;
		
		axis = 0;
		rTheta = [ 0, 0, 0 ];
		//NumTimesToSubdivide = 2;
        vertices = [
        vec3(  0.0000,  0.0000,  1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
        
    ];
        divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);
    	refresh();
    };
    
    document.getElementById("slider").onchange = function(event) {
    	NumTimesToSubdivide = event.target.value;
        points = [];
        colors = [];
        divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);
        refresh();
    };
    
    document.getElementById( "R1" ).onclick = function () {
        rTheta[xAxis] += 2.0;
        refresh();
    };
    document.getElementById( "R2" ).onclick = function () {
        rTheta[yAxis] += 2.0;
        refresh();
    };
    document.getElementById( "R3" ).onclick = function () {
        rTheta[zAxis] += 2.0;
        refresh();
    };
    document.getElementById( "Randomize" ).onclick = function () {
    	pPoints = [];
        drawPlaneT();
        refresh();
    };
    
    window.onkeydown = function(event){
    	var key = String.fromCharCode(event.keyCode);
    	var translate = 0.1;
    	
    	switch(key){
    		case 'W': // CAPS 
    			//trans = 'W';
    			for(var i = 0; i < vertices.length; i++){
    				vertices[i][1] += translate;
    			}
    			/*vertices = [
			        vec3(  0.0000,  0.0000 + translate,  1.0000 ),
			        vec3(  0.0000,  0.9428 + translate,  0.3333 ),
			        vec3( -0.8165, -0.4714 + translate,  0.3333 ),
			        vec3(  0.8165, -0.4714 + translate,  0.3333 )
			       ];*/
			    points = [];
			    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
                 
    			break;
    			
    		case 'S' :
    			for(var j = 0; j <vertices.length; j++){
    				vertices[j][1] -= translate;
    			}
    			points = [];
			    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
    			break;
    			
    		case 'A' :
				for(var k = 0; k < vertices.length; k++){
					vertices[k][0] -=translate;
				}
			    points = [];
			    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
                
    			break;
    		case 'D' :
				for(var m = 0; m < vertices.length; m++){
					vertices[m][0] +=translate;
				}
			    points = [];
			    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
    			break;
    	}
    	refresh();
    };
    
    canvas.addEventListener("mousedown", function(event){
    	//mouseX = event.pageX;
    	//mouseY = event.pageY;
    	prevX = event.pageX;
    	prevY = event.pageY;
    }, false);
    
    canvas.addEventListener("mousemove", function(event){
    	if(event.which == 1){
    		//console.log("sadf");
			var currX = event.pageX;
			var currY = event.pageY;
    		for(var i = 0; i < vertices.length; i++){
	    		vertices[i][0] += (currX - prevX)/100;
	    		vertices[i][1] += -(currY - prevY)/100;
    		}
    		points = []; colors = [];
    		divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
	    	refresh();
	    	prevX = currX;
	    	prevY = currY;
    	}
    	if(event.which == 2){
    		var currRX = event.pageX;
    		var currRY = event.pageY;
    		rTheta[xAxis] += -(currRY - prevY)/10;
    		rTheta[yAxis] += (currRX - prevX)/10;
        	refresh();
        	prevX = currRX;
        	prevY = currRY;
    	}
    }, false);
    
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    
    pModelView = gl.getUniformLocation( pProgram, "modelView" );
    pProjection = gl.getUniformLocation( pProgram, "projection" );

    refresh();
};

function refresh(){
    
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(newPoints), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    render();
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
	for(var i = -10.0; i < 10; i++){
		for(var j = 0.0; j > -20; j--){
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

function drawPlane(){
	var pH = -2.0; // plane height
	for(var i = -10.0; i < 10; i++){
		for(var j = 0.0; j > -20; j--){
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

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
    else {
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


function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	 //  Load shaders and initialize attribute buffers
    
    //program = initShaders( gl, "vertex-shader", "fragment-shader" );
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
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    //eye = vec3(radius*Math.sin(rTheta)*Math.cos(phi), radius*Math.sin(rTheta)*Math.sin(phi), radius*Math.cos(rTheta));
    mvMatrix = lookAt(eye, at , up);
    pMatrix = perspective(fovy, aspect, near, far);
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    
    //rTheta[axis] += 2.0;
	//theta[axis] += 2.0;
	gl.uniform3fv(thetaLoc, rTheta);
	//gl.uniform3fv(thetaLoc, theta);
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
            
    //requestAnimFrame(render);
	//gl.clearColor(0.529, 0.878, 0.980, 1.0); //135,206,250
	//gl.clearColor(0.5, 0.5, 1.0, 1.0);
    
    gl.drawArrays( gl.TRIANGLES, 0, pPoints.length );
    // gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //requestAnimFrame( render );
}

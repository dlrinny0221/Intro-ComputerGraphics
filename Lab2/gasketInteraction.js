var canvas;
//var backCanvas;
var gl;
//var gl2;

var points = [];  // array of points that are generated by subdivision
var newPoints = []; 

var NumTimesToSubdivide = 3; // default number times to dubdivide is 1

// 3 original vertices of the triangle
var vertices = [
        vec2( -0.9, -0.5),
        vec2(  0,  0.5),
        vec2(  0.9, -0.5),  
  ];

 //  Initialize our data for the Sierpinski Gasket

window.onload = function init()
{
	backCanvas = document.getElementById("backLayer");
    canvas = document.getElementById( "gl-canvas" );
    
   /* gl2 = WebGLUtils.setupWebGL( backCanvas );
    if ( !gl2 ) { alert( "WebGL isn't available" ); } */
    gl = WebGLUtils.setupWebGL( canvas, backCanvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    // First, initialize the corners of our gasket with three points
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    //
    //  Configure WebGL
    //
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
    
   /* gl2.viewport(0, 0, backCanvas.width, backCanvas.height );
    //gl2.setContext(gl);
   // gl.clear( gl.COLOR_BUFFER_BIT );
    gl2.clearColor(1.0, 1.0, 1.0, 1.0);
    gl2.clear(gl.COLOR_BUFFER_BIT);
*/
    // triangle
	refresh();
    
    // initialize the event handlers
    // slider, buttons, mousemove, keydown
    //
    document.getElementById("slider").onchange = function(event) {
    	NumTimesToSubdivide = event.target.value;
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    	refresh();
    };
    
    document.getElementById("End").onclick = function () {
        gl.clear( gl.COLOR_BUFFER_BIT );
        rgb = 'R';
    };
    
    document.getElementById("Start").onclick = function () {
    	generateRan();
    	NumTimesToSubdivide = 3;
    	rgb = 'R';
        points = [];
        vertices = [
        vec2( -0.9, -0.5),
        vec2(  0,  0.5),
        vec2(  0.9, -0.5),  
       ];
       divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    	refresh();
    };
    
     document.getElementById("Erase").onclick = function () {
        gl.clear( gl.COLOR_BUFFER_BIT );
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    	refresh();
    };
    
    document.getElementById("Reset").onclick = function () {
        generateRan();
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    	refresh();
    };
 
	document.getElementById("Randomize").onclick = function () {
		generateRan();
        NumTimesToSubdivide = Math.floor(Math.random() * 10 + 1);
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
        rgb = 'R';
    	refresh();
    };
    
    document.getElementById("enter").onclick = function () {
        var input = parseInt(document.getElementById("text").value);
        if(!isNaN(input)){
        	if(input == NumTimesToSubdivide) rgb = 'G';
        	else rgb = 'B';
        	refresh();
        }else{
        	alert( "Ooops.. It is NOT a Number.. Try AGAIN!" );
        }
    };
    
    window.onkeydown = function(event){
    	var key = String.fromCharCode(event.keyCode);
    	switch(key){
    		case 'R':
    			//program = initShaders( gl, "vertex-shader", "fragment-shader-red" );
    			rgb = 'R';
    			break;
    		case 'G' :
    			//program = initShaders( gl, "vertex-shader", "fragment-shader-green" );
    			rgb = 'G';
    			break;
    		case 'B' :
				//program = initShaders( gl, "vertex-shader", "fragment-shader-blue" );
				rgb = 'B';
    			break;
    	}
    	refresh();
    };
    
    canvas.addEventListener("mousemove", function(event){
		// console.log(event.pageX);
		var mouseX = (event.pageX-8-canvas.width/2)/(canvas.width/2); // 8
		// console.log(event.pageY);
		var mouseY = (-(event.pageY-159-40-10-canvas.height/2))/(canvas.height/2);  //159+40=199
		// console.log("X="+canvasX+" Y="+canvasY);
    	if(event.which == 1){ // mouse left click
    		vertices = [
        		vec2( -0.9+mouseX, -0.5+mouseY),
       			vec2(  0+mouseX,  0.5+mouseY),
        		vec2(  0.9+mouseX, -0.5+mouseY),  
  			];
	        points = [];
	        divideTriangle( vertices[0], vertices[1], vertices[2],
	                    NumTimesToSubdivide);
    	}
    	if(event.which == 2){
    		newVer = [
    			vec2(mouseX+Math.random()/50, mouseY),
    			vec2(mouseX-Math.random()/50, mouseY),
    			vec2(mouseX, mouseY+Math.random()/50)
    		]
    		paintTri(newVer[0],newVer[1],newVer[2]);
    	}
    	refresh();
    }, false);
    
   /* canvas.addEventListener("mousedown", function(event){
    	if(event.which == 2){
    		var paintRan = (Math.random()-0.5)/25;
    		var paintX = (event.pageX-8-canvas.width/2)/(canvas.width/2); // 8
       		var paintY = (-(event.pageY-159-canvas.height/2))/(canvas.height/2);
    		var paintVer = [
    			vec2(paintX, paintY),
    			vec2(paintX-paintRan, paintY+paintRan);
    			vec2(paintX+paintRan, paintY+paintRan);
    		]
    		
    		window.onload = function initPaint(){
    			
    		}
    	    
    	}
    }, false);*/
};

var rgb = 'R';
   
function refresh(){
	    //  Load shaders and initialize attribute buffers
    
    // change colors 'r' 'g' 'b'
    var program = initShaders( gl, "vertex-shader", "fragment-shader-red" );
    if(rgb == 'R'){
    	program = initShaders( gl, "vertex-shader", "fragment-shader-red" );
    }else if(rgb == 'G'){
    	program = initShaders( gl, "vertex-shader", "fragment-shader-green" );
    }else if(rgb == 'B'){
    	program = initShaders( gl, "vertex-shader", "fragment-shader-blue" );
    }
    
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

    var n = 25;
    // generate random numbers for preturbing the new vertices
    var ran1 = (Math.random()-0.5)/n;
    var ran2 = (Math.random()-0.5)/n;
    var ran3 = (Math.random()-0.5)/n;
    var ran4 = (Math.random()-0.5)/n;
    var ran5 = (Math.random()-0.5)/n;
    var ran6 = (Math.random()-0.5)/n;

function generateRan(){
    // generate random numbers for preturbing the new vertices
    ran1 = (Math.random()-0.5)/n;
    ran2 = (Math.random()-0.5)/n;
    ran3 = (Math.random()-0.5)/n;
    ran4 = (Math.random()-0.5)/n;
    ran5 = (Math.random()-0.5)/n;
    ran6 = (Math.random()-0.5)/n;
}

function triangle( a, b, c )
{
    points.push( a, b, c, a);
}

function paintTri( a, b, c )
{
    points.push( a, b,b,c, c, a);
}
 
function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    
    }else{
    
        //bisect the sides; midPoints of each side of triangles 
        
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
        
        
        --count;
        
        if (count >= 1){
        
	        var newAB = add(ab, vec2(ran1, ran2));
	        var newAC = add(ac, vec2(ran3, ran4));
	        var newBC = add(bc, vec2(ran5, ran6));
	
	        // three new triangles
	        
	        divideTriangle( a, newAB, newAC, count);
	        divideTriangle( c, newAC, newBC, count);
	        divideTriangle( b, newBC, newAB, count);
        } else {
        	divideTriangle( a, ab, ac, count);
	        divideTriangle( c, ac, bc, count);
	        divideTriangle( b, bc, ab, count);
        }
    }
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, points.length );
    //gl.drawArrays( gl.LINES, 0, newPoints.length );
}
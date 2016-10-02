var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 7;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    
    var vertices = [
      /*  vec2( -0.9, -0.9),
        vec2(  0,  0.9),
        vec2(  0.9, -0.9 ),
        */
        
        vec2( -0.9, -0.5),
        vec2(  0,  0.5),
        vec2(  0.9, -0.5),
        
    ];
    

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c, a);
}
    var n = 25;
    // generate random numbers for preturbing the new vertices
    var ran1 = (Math.random()-0.5)/n;
    var ran2 = (Math.random()-0.5)/n;
    var ran3 = (Math.random()-0.5)/n;
    var ran4 = (Math.random()-0.5)/n;
    var ran5 = (Math.random()-0.5)/n;
    var ran6 = (Math.random()-0.5)/n;
    
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

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, points.length );
}
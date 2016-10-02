

var canvas;
var gl;

var numTimesToSubdivide = 2;
 
var index = 0;
var pointsArray = [];
var normalsArray = [];
var colors = [];

var near = 0.1 ;
var far = 100 ;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
//var dr = 5.0 * Math.PI/180.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

// camera KEY
var wKey = false;
var sKey = false;
var aKey = false;
var dKey = false;
var rKey = false;
var fKey = false;

// light key
var uKey = false;
var jKey = false;
var hKey = false;
var kKey = false;
var oKey = false;
var lKey = false;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye = vec3( 0.0, 0.0, 5.0 );
var at = vec3( eye[0] + radius*Math.sin(theta)*Math.cos(phi), 
    		   eye[1] + radius*Math.sin(phi), 
    		   eye[2] - radius*Math.cos(theta)*Math.cos(phi)
    		   );

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var trans = vec4(0.0, 0.0, 0.0, 0.0);
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var up = vec3(0.0, 1.0, 0.0);
var eye = vec3( 0.0, 0.0, 5.0 );
var at = vec3( eye[0] + radius*Math.sin(theta)*Math.cos(phi), 
    		   eye[1] + radius*Math.sin(phi), 
    		   eye[2] - radius*Math.cos(theta)*Math.cos(phi)
    		   );
    		   
var prevX;
var prevY;

var program;

function repaint(){
	normalB();
	vB();
}

function drawSquare(w, x, y, z, color){
	triangle(w, x, y, color);
	triangle(w, y, z, color);
}

function drawPlane(){
	var pH = -2.0; // plane height
	for(var i = -10.0; i < 10; i++){
		for(var j = 10.0; j > -10.0; j--){
			var c = (i+j)%2+1;
			if (c == 2) c = 0;
			drawSquare(
				vec4(i, pH , j, 1 ),
				vec4(i+1, pH , j, 1 ),
				vec4(i+1, pH , j+1, 1 ),
				vec4(i, pH , j+1, 1 ),
				c+1
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
    
    colors.push( baseC[color]);
    normalsArray.push(d);
    pointsArray.push( d );
    
    colors.push( baseC[color]);
    normalsArray.push(e);
    pointsArray.push( e );
    
    colors.push( baseC[color]);
    normalsArray.push(f);
    pointsArray.push( f );
    
}
    
function triangle(a, b, c, color) {
	 var baseColors = [
        //vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
       //vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0),
        vec3(0.1, 0.5, 0.5)
    ];

     colors.push(baseColors[color]);
     normalsArray.push(a);
     pointsArray.push(a);
     
     colors.push(baseColors[color]);
     normalsArray.push(b);
     pointsArray.push(b); 
     
     colors.push(baseColors[color]); 
     normalsArray.push(c);    
     pointsArray.push(c);
	 
     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
    	a = add( a, trans );
    	b = add( b, trans );
    	c = add( c, trans );
        triangle( a, b, c, 0 );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function eyeAt(){
	at[0] = eye[0] + radius * Math.sin(theta) * Math.cos(phi);
	at[1] = eye[1] + radius                   * Math.sin(phi);
	at[2] = eye[2] - radius * Math.cos(theta) * Math.cos(phi);
}

/*function moveObj(){
	var translate = 0.1;
	if( iKey ){
		trans[1] += translate;
		/*va[1] += translate;
		vb[1] += translate;
		vc[1] += translate;
		vd[1] += translate;
	}
	if( kKey ){
		trans[1] -= translate;
		/*va[1] -= translate;
		vb[1] -= translate;
		vc[1] -= translate;
		vd[1] -= translate;

	}
	if( jKey ){
		trans[0] -= translate;
		/*va[0] -=translate;
		vb[0] -=translate;
		vc[0] -=translate;
		vd[0] -=translate;
	}
	if( lKey ){
		trans[0] += translate;
		/*va[0] +=translate;
		vb[0] +=translate;
		vc[0] +=translate;
		vd[0] +=translate;
	}
	if(iKey || kKey || jKey || lKey ){
		index = 0;
        normalsArray = [];
		pointsArray = [];
   		tetrahedron( va, vb, vc, vd, numTimesToSubdivide);
   		repaint();
	}
}
*/

function moveLight(){
	if(uKey == true){
		lightPosition[1] += 0.1;
	}
	if(jKey == true){
		lightPosition[1] -= 0.1;
	}
	if(hKey == true){
		lightPosition[0] -= 0.1;
	}
	if(kKey == true){
		lightPosition[0] += 0.1;
	}
	if(oKey == true){
		lightPosition[2] += 0.1;
	}
	if(lKey == true){
		lightPosition[2] -= 0.1;
	}
	if(uKey || jKey || hKey || kKey || oKey || lKey){
		repaint();
		colorB();
    	uniform();
	    //gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );	
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
	if(wKey || sKey || aKey || dKey || rKey || fKey){
		colorB();
	    normalB();
	    vB();
	    uniform();
		eyeAt();
	}
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    drawPlane();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;
    gl.clearColor( 0.529, 0.878, 0.980, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    colorB();
	normalB();
	vB();
	uniform();
    
    //
    gl.uniform1f( gl.getUniformLocation(program, "shading"), 0.0 );
    
    document.getElementById( "on" ).onclick = function(){
    	// turning shading on
    	gl.uniform1f( gl.getUniformLocation(program, "shading"), 0.0 );
    };
    document.getElementById( "off" ).onclick = function(){
    	gl.uniform1f( gl.getUniformLocation(program, "shading"), 1.0 );
    	
    };

    //document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    //document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    //document.getElementById("Button2").onclick = function(){theta += dr;};
    //document.getElementById("Button3").onclick = function(){theta -= dr;};
    //document.getElementById("Button4").onclick = function(){phi += dr;};
    //document.getElementById("Button5").onclick = function(){phi -= dr;};
    
    document.getElementById( "FOVinc" ).onclick = function(){ if(fovy < 180) fovy += 2.0; };
    document.getElementById( "FOVdec" ).onclick = function(){ if(fovy > 0 ) fovy -= 2.0; };
    
    document.getElementById("RESET").onclick = function () {
    	index = 0;
        pointsArray = [];
        normalsArray = [];
		numTimesToSubdivide = 2;
		eye = vec3( 0.0, 0.0, 5.0 );
		theta  = 0.0;
		phi    = 0.0;
		at = vec3( eye[0] + radius * Math.sin(theta)*Math.cos(phi), 
    		       eye[1] + radius * Math.sin(phi), 
    		       eye[2] - radius * Math.cos(theta)*Math.cos(phi)
    		     );
    		   
    	fovy = 45.0;
    	va = vec4(0.0, 0.0, -1.0,1);
		vb = vec4(0.0, 0.942809, 0.333333, 1);
		vc = vec4(-0.816497, -0.471405, 0.333333, 1);
		vd = vec4(0.816497, -0.471405, 0.333333,1);
		trans = vec4(0.0, 0.0, 0.0, 0.0);
		
        tetrahedron( va, vb, vc, vd, numTimesToSubdivide);
        drawPlane();
        repaint();
        
       // console.log("fszf");
    };
    
    /*document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };
    */
   
    document.getElementById("slider").onchange = function(event) {
    	numTimesToSubdivide = event.target.value;
    	index = 0;
    	normalsArray = [];
        pointsArray = [];
        tetrahedron( va, vb, vc, vd, numTimesToSubdivide);
        drawPlane();
        repaint();
    };

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
    		
    		/* LIGHT */
    		case 'U' : uKey = true; break;
    		case 'J' : jKey = true; break;
    		case 'H' : hKey = true;	break;
    		case 'K' : kKey = true; break;
    		case 'O' : oKey = true; break;
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
    		
    		/* LIGHT */
    		case 'U' : uKey = false; break;
    		case 'J' : jKey = false; break;
    		case 'H' : hKey = false; break;
    		case 'K' : kKey = false; break;
    		case 'O' : oKey = false; break;
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
	    	}else{
	    		
	    		trans[0] += (currX - prevX) / 100;
				trans[1] -= (currY - prevY) / 100;
    		
    			/*va[0] += trans[0];
    			vb[0] += trans[0];
    			vc[0] += trans[0];
	    		vd[0] += trans[0];
	    		
	    		va[1] += trans[1];
	    		vb[1] += trans[1];
	    		vc[1] += trans[1];
	    		vd[1] += trans[1];
	    		*/
	    		
	    		index = 0;
    			pointsArray = []; 
       			normalsArray = [];
    			tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    			drawPlane();
    			repaint();
	    	}
	    	prevX = currX;
    		prevY = currY;
   		}
    }, false);
    
    render();
}

function colorB(){
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
}

function normalB(){
	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
}

function vB(){
	  
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function uniform(){
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    // ortho(left, right, bottom, ytop, near, far);
            
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
}

function render() {
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    moveCamera();
    moveLight();
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        
    for( var i=0; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}

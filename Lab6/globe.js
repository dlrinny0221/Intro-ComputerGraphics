
var canvas;
var gl;

var numTimesToSubdivide = 25;

var vertices = [];
var indices = [];

var near = 0.1 ;
var far = 100 ;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
//var dr = 5.0 * Math.PI/180.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

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
    
var lightPosition = vec4(1.0, 1.0, 4.5, 1.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 0.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var up = vec3(0.0, 1.0, 0.0);
var eye = vec3( 0.0, 0.0, 5.0 );
var at = vec3( eye[0] + radius*Math.sin(theta)*Math.cos(phi), 
    		   eye[1] + radius*Math.sin(phi), 
    		   eye[2] - radius*Math.cos(theta)*Math.cos(phi)
    		   );
    		   
var prevX;
var prevY;

var shading = 0.0; // key to switch shading mode
var bump = false; // bump mapping key

var program;

function scale( x, y, z )
{
    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;
    return result;
}

// A simple data structure for our vertex data
function Vertex(position, texCoord, normal)
{
    var vertex =  [
            //Offset = 0
            position[0], position[1], position[2], 
            // Offset = 3
            normal[0], normal[1], normal[2], 
            //Offset = 6
            texCoord[0], texCoord[1] 
            //Size = Offset = 8 
        ];

    return vertex;
}

function eyeAt(){
	at[0] = eye[0] + radius * Math.sin(theta) * Math.cos(phi);
	at[1] = eye[1] + radius                   * Math.sin(phi);
	at[2] = eye[2] - radius * Math.cos(theta) * Math.cos(phi);
}

function moveLight(){
	if(uKey == true){
		lightPosition[1] -= 0.1;
	}
	if(jKey == true){
		lightPosition[1] += 0.1;
	}
	if(hKey == true){
		lightPosition[0] += 0.1;
	}
	if(kKey == true){
		lightPosition[0] -= 0.1;
	}
	if(oKey == true){
		lightPosition[2] += 0.1;
	}
	if(lKey == true){
		lightPosition[2] -= 0.1;
	}
	if(uKey || jKey || hKey || kKey || oKey || lKey){
	    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
	}
}

function moveCamera(){
	if(wKey == true){
		eye[0] += Math.sin(theta) / 10;
    	eye[2] -= Math.cos(theta) / 10;
	}
	if(sKey == true){
		eye[0] -= Math.sin(theta) / 10;
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
		eyeAt();
	}
}

//Hard coded offsets and size because javascript doesn't have c style structs and sizeof operator
Vertex.offsetPosition = 0 * Float32Array.BYTES_PER_ELEMENT;
Vertex.offsetNormal = 3 * Float32Array.BYTES_PER_ELEMENT;
Vertex.offsetTexCoord = 6 * Float32Array.BYTES_PER_ELEMENT;
Vertex.size = 8 * Float32Array.BYTES_PER_ELEMENT;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );

    // Load shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );

    // Generate the data for both a plane and a sphere
    GeneratePlane(indices, vertices);
    GenerateSphere(indices, vertices);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with the data from our vertices buffer
    // Data packed as {(position, normal, textureCoord),(position, normal, textureCoord)...}
    // Stride = Vertex.size = sizeof(Vertex)
    // Offset of position data = Vertex.offsetPosition = offsetof(Vertex, position)

    // If you don't understand what stride and offset do look at the documentation...
    // https://www.khronos.org/opengles/sdk/docs/man/xhtml/glVertexAttribPointer.xml
    
    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 3, gl.FLOAT, false, Vertex.size, Vertex.offsetPosition);
    gl.enableVertexAttribArray( aPosition );

    // We didn't actually use aNormal in the shader so it will warn us. However if lighting was added they would be used.
    // INVALID_VALUE: vertexAttribPointer: index out of range 
    // INVALID_VALUE: enableVertexAttribArray: index out of range 
    var aNormal = gl.getAttribLocation( program, "aNormal" );
    gl.vertexAttribPointer( aNormal, 3, gl.FLOAT, false, Vertex.size, Vertex.offsetNormal );
    gl.enableVertexAttribArray( aNormal );

    var aTextureCoord = gl.getAttribLocation( program, "aTextureCoord" );
    gl.vertexAttribPointer( aTextureCoord, 2, gl.FLOAT, false, Vertex.size, Vertex.offsetTexCoord);
    gl.enableVertexAttribArray( aTextureCoord );

    gl.uniform1i( gl.getUniformLocation( program, "textureUnit0" ), 0); //Already 0 but lets be explicit
    
     document.getElementById("RESET").onclick = function(){
     	eye = vec3( 0.0, 0.0, 5.0 );
		theta  = 0.0;
		phi    = 0.0;
		at = vec3( eye[0] + radius * Math.sin(theta)*Math.cos(phi), 
    		       eye[1] + radius * Math.sin(phi), 
    		       eye[2] - radius * Math.cos(theta)*Math.cos(phi)
    		     );
    		   
    	//shading = 1.0;	   
    	fovy = 45.0;
    	va = vec4(0.0, 0.0, -1.0,1);
		vb = vec4(0.0, 0.942809, 0.333333, 1);
		vc = vec4(-0.816497, -0.471405, 0.333333, 1);
		vd = vec4(0.816497, -0.471405, 0.333333,1);
		trans = vec4(0.0, 0.0, 0.0, 0.0);
		lightPosition = vec4(1.0, 1.0, 4.5, 1.0 );
		lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
		lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
		lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
		
		materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
		materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
		materialSpecular = vec4( 0.0, 0.8, 0.0, 1.0 );
		materialShininess = 100.0;
	
     	vertices = [];
     	indices = [];
     	tex1 = texEarth;
     	tex2 = texPlane;
     	GenerateSphere(indices, vertices);
     	GeneratePlane(indices, vertices);
     	gl.uniform1f( gl.getUniformLocation(program, "shading"), 0.0 );

     };
     
     document.getElementById("Mipmapping & Interpolation ON").onclick = function(){
     	tex2 = texPlaneM;
     	if(tex1 == texEarth) tex1 = texEarthM;
     	if(tex1 == texMoon) tex1 = texMoonM;
     	if(tex1 == texSun) tex1 = texSunM;
     	if(tex1 == texChecker) tex1 = texCheckerM;
     };
     
     document.getElementById("Mipmapping & Interpolation OFF").onclick = function(){
     	tex2 = texPlane;
     	if(tex1 == texEarthM) tex1 = texEarth;
     	if(tex1 == texMoonM) tex1 = texMoon;
     	if(tex1 == texSunM) tex1 = texSun;
     	if(tex1 == texCheckerM) tex1 = texChecker;
     };
     
     document.getElementById("ON").onclick = function(){
     	gl.uniform1f( gl.getUniformLocation(program, "shading"), 0.0 );
     };
     
     document.getElementById("OFF").onclick = function(){
     	gl.uniform1f( gl.getUniformLocation(program, "shading"), 1.0 );
     };
     
    document.getElementById( "NO" ).onclick = function(){
    	/*colors.push(white);
    	vertices = [];
     	//indices = [];
     	GenerateSphere();*/
     	tex1 = texWhite;
     };
     
     document.getElementById("CHECKER").onclick = function(){
     	tex1 = texChecker;
     };
     
     document.getElementById("SUN").onclick = function(){
     	tex1 = texSun;
     };
     
     document.getElementById("MOON").onclick = function(){
     	tex1 = texMoon;
     };
     
     document.getElementById("EARTH").onclick = function(){
     	/*vertices = [];
     	indices = [];
     	GeneratePlane(indices, vertices);
     	GenerateSphere(indices, vertices);*/
     	//render(texEarth, texPlane);
     	tex1 = texEarth;
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
				trans[1] += (currY - prevY) / 100;
				
				/*vertices = [];
				indices = [];
				GenerateSphere(indices, vertices);
				GeneratePlane(indices, vertices);
				buffers();*/
	    		
	    	}
	    	prevX = currX;
    		prevY = currY;
   		}
    }, false);
    
    //A texture that doesn't repeat and has bilinear filtering
    	
    var texEarth = CreateTexture('earth.jpg',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    );
    
    var texEarthM = CreateTexture('earth.jpg',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    );

    //A texture the repeats with nearest filtering
    var texPlane = CreateTexture('Checker.png',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    );
    
    var texPlaneM = CreateTexture('Checker.png',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    );
    
    var tex1 = texEarth;
	var tex2 = texPlane;
	
    var texChecker = gl.createTexture();
    var wbArray = [];

    for(var i = 0; i < 8; i++){
    	for(var j = 16; j > 0; j--){
    		var c = (i+j+1)%2;
    		if(c == 0) wbArray.push(255, 255, 255, 255);
    		else if(c == 1) wbArray.push(0, 0, 0, 255);
    	}
    }
    gl.bindTexture(gl.TEXTURE_2D, texChecker);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(wbArray));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    var texCheckerM = gl.createTexture();
    var wbArrayM = [];

    for(var i = 0; i < 8; i++){
    	for(var j = 16; j > 0; j--){
    		var c = (i+j+1)%2;
    		if(c == 0) wbArrayM.push(255, 255, 255, 255);
    		else if(c == 1) wbArrayM.push(0, 0, 0, 255);
    	}
    }
    gl.bindTexture(gl.TEXTURE_2D, texCheckerM);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(wbArrayM));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    var texWhite = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texWhite);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    var texSun = CreateTexture('texture_sun.jpg', function(texture, image)
    {
    	 	gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  );
  
  	var texSunM = CreateTexture('texture_sun.jpg',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    );
    
    
    var texMoon = CreateTexture('moon_surface.jpg', function(texture, image)
    {
    	 	gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  );
  
  var texMoonM = CreateTexture('moon_surface.jpg',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    );
    

    //Rendering this scene will warn about not complete textures until they are loaded.
    var myVar = setInterval
    (
        function () 
        {
            render(tex1, tex2);
        }, 16
    );
};

function CreateTexture(file, loaded) 
{
    var texture = gl.createTexture();
    var image = new Image();

    image.onload = function() 
    {
        loaded(texture, image);
    }
    image.src = file;

    return texture;
}

function GeneratePlane(indices, vertices)
{
    //The texture is in wrap = repeat so access outside the 0-1 mapped back into range.
    vertices.push(Vertex(vec3(-1, 0, -1), vec2(0, 0), vec3(0, 1, 0)));
    vertices.push(Vertex(vec3(-1, 0, 1), vec2(10, 0), vec3(0, 1, 0)));
    vertices.push(Vertex(vec3(1, 0, 1), vec2(10, 10), vec3(0, 1, 0)));
    vertices.push(Vertex(vec3(1, 0, -1), vec2(0, 10), vec3(0, 1, 0)));
    indices.push(0, 1, 2, 0, 2, 3);
}

function GenerateSphere(indices, vertices)
{
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    var verticesBegin = vertices.length;

    // Generate coordinates
    for (j = 0; j <= numTimesToSubdivide; j++) 
    {
        aj = j * Math.PI / numTimesToSubdivide;
        sj = Math.sin(aj);
        cj = Math.cos(aj);

        for (i = 0; i <= numTimesToSubdivide; i++) 
        {
            ai = i * 2 * Math.PI / numTimesToSubdivide;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            var x = si * sj;
            var y = cj;      
            var z = ci * sj; 
            vertices.push(Vertex(vec3(x, y, z), vec2(i/numTimesToSubdivide, (1 - y)/2), vec3(x, y, z)));
        }
    }

    // Generate indices
    for (j = 0; j < numTimesToSubdivide; j++) 
    {
        for (i = 0; i < numTimesToSubdivide; i++) 
        {
            p1 = j * (numTimesToSubdivide+1) + i;
            p2 = p1 + (numTimesToSubdivide+1);

            indices.push(p1 + verticesBegin);
            indices.push(p2 + verticesBegin);
            indices.push(p1 + 1 + verticesBegin);

            indices.push(p1 + 1 + verticesBegin);
            indices.push(p2 + verticesBegin);
            indices.push(p2 + 1 + verticesBegin);
        }
    }
}

function render(tex0, tex1)
{
	 //View and projection are the same for both objects
	projection = perspective(fovy, aspect, near, far);
	view = lookAt(eye, at, up);
	
    moveCamera();
    moveLight();
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //window.requestAnimFrame(render);
	//render.time = 0;
    //render.time += .16;    
	
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "projection" ), false, flatten(projection) );
    
    //PLANE
    //Bind the texture we want to use
    gl.bindTexture(gl.TEXTURE_2D, tex1); //assuming activeTexture = TEXTURE0

    var model = mult(translate(0, -1, 0), scale(2, 2, 2));
    var modelView = mult(view, model);
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "modelView" ), false, flatten(modelView));

    //Draw the 6 indices of the plane
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    //END PLANE

	//SPHERE
    gl.bindTexture(gl.TEXTURE_2D, tex0); //assuming activeTexture = TEXTURE0

    var model = mult(mult(translate(trans[0], 0, trans[1]), scale(.5, .5, .5)), rotate(90, vec3(0, 1, 0)));
    var modelView = mult(view, model);
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "modelView" ), false, flatten(modelView));

    //Draw the indices of the sphere offset = 6 indices in the plane * sizeof(UNSIGNED_SHORT)
    gl.drawElements(gl.TRIANGLES, indices.length-6, gl.UNSIGNED_SHORT, 6 * Uint16Array.BYTES_PER_ELEMENT);
    //END SPHERE
    
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
}


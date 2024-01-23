// These are the definitions of the various rigging skeletons in use.
const programs = {
	'solid' : {
		vshader: 'attribute vec4 aPos; uniform mat4 uProj; uniform mat4 uTrans; void main() { gl_Position = uProj * uTrans * aPos; }',
		fshader: 'precision mediump float; uniform vec4 uColor; void main() { gl_FragColor = uColor; }',
		loc: null,		// replaced with reference to linked program
		attributes: {
			'aPos': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 3,			// set to the number of elements in the attribute
				type: 'float',	// set to the webgl constant for the type
				stride: 0,		// the number of bytes skipped between instances
				offset: 0		// the number of bytes from the buffer start
			}
		},
		matrices: {
			'uProj': {
				loc: null,		// set to the attribute location (returned by gl call for program)
			},
			'uTrans': {
				loc: null,		// set to the attribute location (returned by gl call for program)
			}
		},
		uniforms: {
			'uColor': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 4			// set to the number of elements in the uniform (1, 2, 3, 4)
			}
		}
	},
	'rules' : {
		vshader:
			'attribute vec4 aPos; uniform mat4 uProj; uniform mat4 uTrans; uniform float uOffset; uniform float uScale;'
			+ ' void main() { gl_Position = uProj * uTrans * vec4(aPos.x + uOffset, aPos.y * uScale, aPos.z * uScale, aPos.w); }',
		fshader: 'precision mediump float; uniform vec4 uColor; void main() { gl_FragColor = uColor; }',
		loc: null,		// replaced with reference to linked program
		attributes: {
			'aPos': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 3,			// set to the number of elements in the attribute
				type: 'float',	// set to the webgl constant for the type
				stride: 0,		// the number of bytes skipped between instances
				offset: 0		// the number of bytes from the buffer start
			}
		},
		matrices: {
			'uProj': {
				loc: null,		// set to the attribute location (returned by gl call for program)
			},
			'uTrans': {
				loc: null,		// set to the attribute location (returned by gl call for program)
			}
		},
		uniforms: {
			'uColor': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 4			// set to the number of elements in the uniform (1, 2, 3, 4)
			},
			'uOffset': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 1			// set to the number of elements in the uniform (1, 2, 3, 4)
			},
			'uScale': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 1			// set to the number of elements in the uniform (1, 2, 3, 4)
			}
		}
	},
	'verts' : {
		vshader:
			'attribute vec4 aPos; uniform mat4 uProj; uniform mat4 uTrans; uniform float uSize;'
			+ ' void main() { gl_Position = uProj * uTrans * aPos.x; gl_PointSize = uSize; }',
		fshader: 'precision mediump float; uniform vec4 uColor; void main() { gl_FragColor = uColor; }',
		loc: null,		// replaced with reference to linked program
		attributes: {
			'aPos': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 3,			// set to the number of elements in the attribute
				type: 'float',	// set to the webgl constant for the type
				stride: 0,		// the number of bytes skipped between instances
				offset: 0		// the number of bytes from the buffer start
			}
		},
		matrices: {
			'uProj': {
				loc: null,		// set to the attribute location (returned by gl call for program)
			},
			'uTrans': {
				loc: null,		// set to the attribute location (returned by gl call for program)
			}
		},
		uniforms: {
			'uColor': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 4			// set to the number of elements in the uniform (1, 2, 3, 4)
			},
			'uSize': {
				loc: null,		// set to the attribute location (returned by gl call for program)
				len: 1			// set to the number of elements in the uniform (1, 2, 3, 4)
			}
		}
	}
}

const buffers = {
	'axis': { type: 'float', data: [1,0,0, -.9,0,0, .9,0,.05, .9,.05,0, .9,0,-.05, .9,-.05,0, -1,0,.05, -1,.05,0, -1,0,-.05, -1,-.05,0,
		0,-1,0, 0,1,0, 0,0,-1, 0,0,1
	 ] }
};

const ebuffers= {
	'axis': { type: 'uint16', data: [0,1, 0,2, 0,3, 0,4, 0,5, 1,6, 1,7, 1,8, 1,9] },
	'rule': { type: 'uint16', data: [10,11,12,13 ] }
};

/*
const rigDefs = {
	// This is a single item in the game, lying on the ground.
	'static': [
		// An individual bone in the skeleton.
		// The projection for each bone will be named uFullProj_{index} in the vertex shader
		// If needed, the bone's transform will be named uBoneTrans_{index} as well
		{
			root: -1,	//	the index of the parent
			func: "rotatey",	//	to be replaced with the function to call
			index: 16	//	index into the thing.pose array for the parameters
		},
		{
			root: 0,	//	the index of the parent
			func: "matrix",	//	to be replaced with the function to call
			index: 0	//	index into the thing.pose array for the parameters
		}
	]
};

const skins = {
	'cube': {
		// Will be used for floating-point data.
		// Will be replaced with a reference to the created buffer.
		fbuffer: [
			-1.0, -1.0, -1.0,
			 1.0, -1.0, -1.0,
			-1.0,  1.0, -1.0,
			 1.0,  1.0, -1.0,
			-1.0, -1.0,  1.0,
			 1.0, -1.0,  1.0,
			-1.0,  1.0,  1.0,
			 1.0,  1.0,  1.0
		],

		// Will be used for integer data. (Mostly used in switch statements)
		// Will be replaced with a reference to the created buffer.
		// Can be missing if not needed.
		// ibuffer: [0,1,2],

		// The vertex shader for drawing this data.
		vshader: 'attribute vec4 aPos; uniform mat4 uProj_0; void main() { gl_Position = uProj_0 * aPos; }',

		// The fragment shader for drawing this data.
		fshader: 'precision mediump float; uniform vec4 uSolidColor; void main() { gl_FragColor = uSolidColor; }',

		// Set to the handle when it's linked
		program: null,

		//	controls whether the depth buffer is involved
		depth: true,

		// Setup prior to each call
		attribs: {
			'aPos': {	// the name of the attribute
				loc: null,	// set to the attribute's location
				buffer: null, // set to the buffer to be used
				type:	'f',	// or 'i', used for selecting the attribs's buffer
				len:	3,		// the number of elements
				offset:	0,		// number of bytes to the first attrib
				stride: 0		// number of bytes between attribs
			}
		},

		// Also set up prior to each call
		uniforms: {
			'uSolidColor': {	// the name of the uniform
				loc: null,	// set to the uniform's location
				offset:	0,	// the index into thing.uniform array
				type: '4f'	// the function to call for building the uniform
			}
		},

		// Set to the locations of the combined projection uniforms
		// These put vertices to the screen
		projections: [],

		// Set to the locations of the transform uniforms
		// These are for transforming normals
		transforms: []
	}
};

const drawDefs = {
	'cube': {
		skin: 'cube',
		type: 'lines',
		ebuffer: [0,1, 2,3, 4,5, 6,7, 0,2, 1,3, 4,6, 5,7, 0,4, 1,5, 2,6, 3,7]
	}
};

const things = {
	'banner1': {
		// replaced with reference to the rigDef used
		rigDef: 'static',

		// The specific pose settings in use
		pose: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1,
			0],

		// The calculated transform of each bone in the rig, converted to a Float32Array
		bones: [],

		// The calculated projection for each bone in the rig, converted to a Float32 array
		projs: [],

		// Other parameters for drawing (colors, etc.)
		uniform: [0,1,0,1],

		// the specific items to be drawn
		draws: [
			{
				// The specific draw definition to be used
				drawDef: 'cube',

				// The bones to be used
				bones: [0]
			}
		]
	}
}

const calls = [
	{
		program: 'program_name',	// set to reference to the linked program
									// passed to gl.useProgram();
		attributes: [
			{
				buffer,	// set to the buffer to be used
				loc,	// set to the attribute location
				len,	// set to the number of elements in the attribute
				type,	// set to the web gl constant for the type (float, unsigned short, unsigned byte)
				stride,	// set to the stride value
				offset	// set to the offset value
				// code:
				// gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				// gl.vertexAttribPointer(loc, len, type, false, stride, offset);
				// gl.enableVertexAttribArray(loc);
			}
		],
		uniforms: [
			{
				func: the specific uniform function to call,
				loc: uniform loc in program,
				data: an object with the vector data
				// code: func(loc, data);
			}
		],
		matrices: [
			{
				loc: uniform loc in program,
				data: an object with the vector data
				// code: gl.uniformMatrix4fv(loc, data);
			}
		],

		depth_test: 'on/off'	// replaced with either gl.enable or gl.disable
		// code: depth_test(gl.DEPTH_TEST);

		ebuffer: 'ebuffer_name',	// replaced with reference to the integer buffer with the elements

		type:	'lines',			// replaced with the webgl constant for the primitive type
		count:	-1,					// replaced with the element count
		enabled: true/false			// Allows turning off
	}
];

class LsmThing
{
	constructor() {
		this.hidden = false;
		this.delete = false;
		this.data = {};
	}

	// Replace with the function that will render the specific object
	render(data) { }

	// Replace with the function that will return the depth of the object if it intersects
	// the passed rectangle, or null if it does not so intersect.
	hover(data, rect) { return null; }

	// Replace with the function that will respond to left mouse clicks.
	leftClick(data, point) { }

	// Replace with the function that will respond to right mouse clicks.
	rightClick(data, point) { }

	// Replace with the function that will advance the display state.
	animate(data, time) { }
}

*/

function onLoad()
{
	canvas = document.querySelector('#glcanvas');
	gl = canvas.getContext('webgl');

	if (null === gl)
	{
		alert('Your browser does not support WebGL. LionSnake cannot run in this browser.');
		return;
	}

	for (const key in programs)
	{
		const program = programs[key];

		const vshader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vshader, program.vshader);
		gl.compileShader(vshader);

		if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS))
		{
			alert(`The error "${gl.getShaderInfoLog(vshader)}" happened when compiling the vertex shader for "${key}".`);
			program.loc = null;
		}

		const fshader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fshader, program.fshader);
		gl.compileShader(fshader);

		if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS))
		{
			alert(`The error "${gl.getShaderInfoLog(fshader)}" happened when compiling the fragment shader for "${key}".`);
			program.loc = null;
		}

		program.loc = gl.createProgram();
		gl.attachShader(program.loc, vshader);
		gl.attachShader(program.loc, fshader);
		gl.linkProgram(program.loc);

		if (gl.getProgramParameter(program.loc, gl.LINK_STATUS))
		{
			programList[program.loc] = program;
		}
		else
		{
			alert(`The error "${gl.getProgramInfoLog(program.loc)}" happened when linking a shader program.`);
			program.loc = null;
		}

		for (const key2 in program.attributes)
		{
			const attrib = program.attributes[key2];

			attrib.loc = gl.getAttribLocation(program.loc, key2);

			switch (attrib.type)
			{
				case 'float':	attrib.type = gl.FLOAT;				break;
				case 'int8':	attrib.type = gl.BYTE;				break;
				case 'int16':	attrib.type = gl.SHORT;				break;
				case 'uint8':	attrib.type = gl.UNSIGNED_BYTE;		break;
				case 'uint16':	attrib.type = gl.UNSIGNED_SHORT;	break;
			}
		}

		for (const key2 in program.uniforms)
		{
			const uni = program.uniforms[key2];

			uni.loc = gl.getUniformLocation(program.loc, key2);

			switch (uni.len)
			{
				case 1: uni.func = gl.uniform1fv.bind(gl); break;
				case 2: uni.func = gl.uniform2fv.bind(gl); break;
				case 3: uni.func = gl.uniform3fv.bind(gl); break;
				case 4: uni.func = gl.uniform4fv.bind(gl); break;
			}
		}

		for (const key2 in program.matrices)
		{
			const matrix = program.matrices[key2];

			matrix.loc = gl.getUniformLocation(program.loc, key2);
		}
	}

	for (const key in buffers)
	{
		const buffer = buffers[key];

		const loc = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, loc);

		switch (buffer.type)
		{
			case 'float':
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer.data), gl.STATIC_DRAW);
			break;
			case 'int16':
				gl.bufferData(gl.ARRAY_BUFFER, new Int16Array(buffer.data), gl.STATIC_DRAW);
			break;
			case 'uint16':
				gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(buffer.data), gl.STATIC_DRAW);
			break;
			case 'int8':
				gl.bufferData(gl.ARRAY_BUFFER, new Int8Array(buffer.data), gl.STATIC_DRAW);
			break;
			case 'uint8':
				gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(buffer.data), gl.STATIC_DRAW);
			break;
		}

		buffers[key] = loc;
	}

	for (const key in ebuffers)
	{
		const ebuffer = ebuffers[key];

		const loc = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loc);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(ebuffer.data), gl.STATIC_DRAW);

		ebuffers[key] = loc;
	}

	const rect = document.body.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

	window.requestAnimationFrame(animationLoop);
}

function animationLoop(timeStamp)
{
	if (null === startTime) startTime = timeStamp;	// startTime declared in globals.js

	const time = timeStamp - startTime;

	gl.clearColor(...background);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	thisProject?.render();

	window.requestAnimationFrame(animationLoop);
}

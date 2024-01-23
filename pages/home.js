let downX = 0;
let downY = 0;

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
		console.log(`Processing program ${key}.`);

		const program = programs[key];

		const vshader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vshader, program.vshader);
		gl.compileShader(vshader);

		const fshader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fshader, program.fshader);
		gl.compileShader(fshader);

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
			console.log(`Processing attribute ${key2}.`);
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
			console.log(`Processing uniform ${key2}.`);

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
		console.log(`Processing buffer ${key}.`);

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
		console.log(`Processing element buffer ${key}.`);

		const ebuffer = ebuffers[key];

		const loc = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loc);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(ebuffer.data), gl.STATIC_DRAW);

		ebuffers[key] = loc;
	}

	things['axes'] = new LsmAxes();

	window.requestAnimationFrame(animationLoop);
}

function onMouseClick()
{
	return false;
}

function onContextMenu()
{
	return false;
}

function onMouseDown(e)
{
	downX = e.clientX;
	downY = e.clientY;

	dragMode = document.toolbar.mode.value;

	switch (dragMode)
	{
		case 's':
			zoom_save = zoom;
		break;
		case 'r':
			for (let i = 0; i < 16; i++) m_sav[i] = m_rot[i];
		break;
		case 't':
			p_sav = [...p_eye];
		break;
	}

	mouseMode = 1;
}

function onMouseUp(e)
{
	mouseMode = 0;
}

function onMouseMove(e)
{
	switch (mouseMode)
	{
		case 1:
			const aX = downY - e.clientY;
			const aY = downX - e.clientX;
			const mag = Math.sqrt(aX * aX + aY * aY);

			switch (dragMode)
			{
				case 's':
					const dx1 = downX - centerX;
					const dy1 = downY - centerY;
					const dx2 = e.clientX - centerX;
					const dy2 = e.clientY - centerY;
					const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
					const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
					if (mag2 !== 0) zoom = zoom_save * mag2 / mag1;
				break;
				case 'r':
					if (0 === mag)
					{
						for (let i = 0; i < 16; i++) m_rot[i] = m_sav[i];
					}
					else
					{
						const u = aX / mag;
						const v = aY / mag;
						const c = Math.cos(mag * .01);
						const s = Math.sin(mag * .01);

						multiply(m_sav,
							[
								u * u + c * v * v, u * v - c * u * v, -s * v, 0,
								u * v - c * u * v, v * v + c * u * u, s * u, 0,
								s * v, -s * u,  c, 0,
								0, 0, 0, 1
							],
							m_rot
						);
					}
				break;
				case 't':
					const d = Math.min(gl.canvas.width, gl.canvas.height);
					const dx = (e.clientX - downX) / d;
					const dy = (e.clientY - downY) / d;
					p_eye[0] = p_sav[0] - (m_rot[0] * dx - m_rot[1] * dy) * 2 / zoom;
					p_eye[1] = p_sav[1] - (m_rot[4] * dx - m_rot[5] * dy) * 2 / zoom;
					p_eye[2] = p_sav[2] - (m_rot[8] * dx - m_rot[9] * dy) * 2 / zoom;
				break;
			}

		break;
	}
}

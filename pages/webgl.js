function animationLoop(timeStamp)
{
	const rect = document.body.getBoundingClientRect();

	// set viewport to current canvas size
	canvas.width = rect.width;
	canvas.height = rect.height;

	if (null === startTime) startTime = timeStamp;	// startTime declared in globals.js

	const time = timeStamp - startTime;

	renderScene(time);

	window.requestAnimationFrame(animationLoop);
}

function renderScene(time)
{
//	console.log('> Entering renderScene().');

	gl.clearColor(...background);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	centerX = gl.canvas.width / 2;
	centerY = gl.canvas.height / 2;

	let v_r = [m_rot[0], m_rot[4], m_rot[8]];
	let v_u = [m_rot[1], m_rot[5], m_rot[9]];
	let v_f = [m_rot[2], m_rot[6], m_rot[10]];

// tuck these into a matrix for easy multiplication
	const m_p = [
		m_rot[0], m_rot[1], m_rot[2], 0,
		m_rot[4], m_rot[5], m_rot[6], 0,
		m_rot[8], m_rot[9], m_rot[10], 0,
		-dot(v_r,p_eye), -dot(v_u,p_eye), -dot(v_f,p_eye), 1];

	let d = Math.min(gl.canvas.width, gl.canvas.height);

	multiply(
		m_p,
		[
			d / gl.canvas.width, 0, 0, 0,
			0, d / gl.canvas.height, 0, 0,
			0,0,1,0,
			0,0,0,1
		],
		pers
	);

//	Perspective projection
//	multiply(pers, [1,0,0,0, 0,1,0,0, 0,0,2 / (far - near),1, 0,0,(near + far)/(near - far),0], pers);
//	Orthographics projection
	multiply(pers, [1,0,0,0, 0,1,0,0, 0,0,2 / (far - near),0, 0,0,(near + far)/(near - far),1], pers);

	if (true)
	{
		for(key in things)
		{
			const thing = things[key];

			if (!thing) continue;

			thing.animate(thing.data, time);

			if (thing.hidden) continue;
			thing.render(thing.data);
		}
	}

	if (false)
	{
		// each item is something to be rendered
		for (const key in things)
		{
			item = things[key];
			item.calcBones = [];
			item.calcProjs = [];
			
			// recalculate the transforms
			item.rigDef.forEach((bone, index) => {
				const matrix = [...identity];
				bone.func(matrix, item.pose, bone.index);

				if (bone.root !== -1)
				{
					multiply(matrix, item.calcBones[bone.root], matrix);
				}

				item.calcBones.push([...matrix]);
				multiply(matrix, pers, matrix);
				item.calcProjs.push([...matrix]);
			});

			item.calcBones.forEach((matrix, index) => {
				item.calcBones[index] = new Float32Array(item.calcBones[index]);
			});

			item.calcProjs.forEach((matrix, index) => {
				item.calcProjs[index] = new Float32Array(item.calcProjs[index]);
			});

			item.draws.forEach((draw) => {
				gl.useProgram(draw.drawDef.skin.program);

				if (draw.drawDef.skin.depth)
				{
					gl.enable(gl.DEPTH_TEST)
				}
				else
				{
					gl.disable(gl.DEPTH_TEST);
				}

				draw.bones.forEach((bone, index) => {
					gl.uniformMatrix4fv(draw.drawDef.skin.transforms[index], false, item.calcBones[bone]);
					gl.uniformMatrix4fv(draw.drawDef.skin.projections[index], false, item.calcProjs[bone]);
				});

				for (const key2 in draw.drawDef.skin.attribs)
				{
					const attrib = draw.drawDef.skin.attribs[key2];

					gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
					gl.vertexAttribPointer(attrib.loc, attrib.len, (attrib.type === 'f') ? gl.FLOAT : gl.UNSIGNED_SHORT, false, attrib.stride, attrib.offset);
					gl.enableVertexAttribArray(attrib.loc);
				}

				if (draw.drawDef.ebuffer)
				{
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, draw.drawDef.ebuffer);
				}
				else
				{
					console.log('This should not have happened.');
				}

				for (const key2 in draw.drawDef.skin.uniforms)
				{
					const uniform = draw.drawDef.skin.uniforms[key2];

					switch (uniform.type)
					{
						case '1f': gl.uniform1f(uniform.loc, item.uniform[uniform.offset]); break;
						case '2f': gl.uniform2f(uniform.loc, item.uniform[uniform.offset], item.uniform[uniform.offset + 1]); break;
						case '3f': gl.uniform3f(uniform.loc, item.uniform[uniform.offset], item.uniform[uniform.offset + 1], item.uniform[uniform.offset + 2]); break;
						case '4f': gl.uniform4f(uniform.loc, item.uniform[uniform.offset], item.uniform[uniform.offset + 1], item.uniform[uniform.offset + 2], item.uniform[uniform.offset + 3]); break;
					}
				}

				gl.drawElements(draw.drawDef.type, draw.drawDef.count, gl.UNSIGNED_SHORT, 0);
			});
		}
	}

	renderCalls.forEach((call) => {
		if (!call.enabled) return;
		gl.useProgram(call.loc);

		call.attributes.forEach((attrib) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
			gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
			gl.enableVertexAttribArray(attrib.loc);
		});

		call.uniforms.forEach((uni) => {
			uni.func(uni.loc, uni.data);
		});

		call.matrices.forEach((mat) => {
			gl.uniformMatrix4fv(mat.loc, false, mat.data);
		});

		call.depth_test(gl.DEPTH_TEST);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, call.ebuffer);
		gl.drawElements(call.type, call.count, gl.UNSIGNED_SHORT, 0);
	});


//	console.log('< Exiting renderScene().');
}

function createCall(program_name, type, depth, enabled)
{
	const call = {};

	const program = programs[program_name];

	call.loc = program.loc;

	call.attributes = [];

	for (const key in program.attributes)
	{
		call.attributes.push({...program.attributes[key]});
	}

	call.uniforms = [];
	call.matrices = [];

	for (const key in program.uniforms)
	{
		call.uniforms.push({...program.uniforms[key]});
	}

	for (const key in program.matrices)
	{
		call.matrices.push({...program.matrices[key]});
	}

	switch (type.toLowerCase())
	{
		case 'points':
			call.type = gl.POINTS;
		break;
		case 'line_strip':
			call.type = gl.LINE_STRIP;
		break;
		case 'loop':
			call.type = gl.LINE_LOOP;
		break;
		case 'lines':
			call.type = gl.LINES;
		break;
		case 'triangle_strip':
			call.type = gl.TRIANGLE_STRIP;
		break;
		case 'fan':
			call.type = gl.TRIANGLE_FAN;
		break;
		case 'triangles':
			call.type = gl.TRIANGLES;
		break;
		default:
			throw 'Primitive "' + type + '" is not a recognized type.';
	}

	call.depth_test = depth ? gl.enable.bind(gl) : gl.disable.bind(gl);
	call.ebuffer = null;
	call.enabled = enabled;

	renderCalls.push(call);

	return call;
}

function getAttribute(call, name)
{
	const program = programList[call.loc];
	const loc = program.attributes[name].loc;

	let retval = null;

	call.attributes.forEach((attrib) =>
	{
		if (attrib.loc === loc) retval = attrib;
	});

	return retval;
}

function getUniform(call, name)
{
	const program = programList[call.loc];
	const loc = program.uniforms[name].loc;
	let retval = null;

	call.uniforms.forEach((uni) =>
	{
		if (uni.loc === loc) retval = uni;
	});

	return retval;
}

function getMatrix(call, name)
{
	console.log(`Getting matrix "${name}".`);
	const program = programList[call.loc];
	console.log(`> program: ${program}.`);
	const loc = program.matrices[name].loc;
	console.log(`> loc: "${loc}".`);
	let retval = null;

	call.matrices.forEach((matrix) =>
	{
		console.log(`loc of matrix "${name}": ${matrix.loc}.`);
		if (matrix.loc === loc) retval = matrix;
	});

	return retval;
}

// This is the main function for server calls.
function postMessage(url, data, responseHandler)
{
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.then(data => {
		responseHandler(data);
	})
	.catch(error => {});
}

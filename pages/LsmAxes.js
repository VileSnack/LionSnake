const colorX = new Float32Array([1,0,0,1]);
const colorY = new Float32Array([0,1,0,1]);
const colorZ = new Float32Array([0,0,1,1]);

// Replace with the function that will render the specific object
function renderAxes(obj_s, m_rot, obj_t, cam_mat)
{
	// build some flipping transforms
	// Todo: Add the scaling and translate if they become necessary
	const xtrans = new Float32Array([ m_rot[0],m_rot[1],m_rot[2],0, m_rot[3],m_rot[4],m_rot[5],0, m_rot[6],m_rot[7],m_rot[8],0, 0,0,0,1 ]);
	const ytrans = new Float32Array([ m_rot[3],m_rot[4],m_rot[5],0, m_rot[6],m_rot[7],m_rot[8],0, m_rot[0],m_rot[1],m_rot[2],0, 0,0,0,1 ]);
	const ztrans = new Float32Array([ m_rot[6],m_rot[7],m_rot[8],0, m_rot[0],m_rot[1],m_rot[2],0, m_rot[3],m_rot[4],m_rot[5],0, 0,0,0,1 ]);

	// first the axes
	let program = programs['solid'];
	let attrib = program.attributes['aPos'];
	let ebuffer = ebuffers['axis'];
	let color = program.uniforms['uColor'];
	let proj = program.matrices['uProj'];
	let trans = program.matrices['uTrans'];

	gl.useProgram(program.loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers['axis']);
	gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
	gl.enableVertexAttribArray(attrib.loc);
	gl.enable(gl.DEPTH_TEST)
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuffers['axis']);
	gl.uniformMatrix4fv(proj.loc, false, cam_mat);

	// draw the x axis
	color.func(color.loc, colorX);
	gl.uniformMatrix4fv(trans.loc, false, xtrans);
	gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

	// draw the y axis
	color.func(color.loc, colorY);
	gl.uniformMatrix4fv(trans.loc, false, ytrans);
	gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

	// draw the z axis
	color.func(color.loc, colorZ);
	gl.uniformMatrix4fv(trans.loc, false, ztrans);
	gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

	// draw the rules
	program = programs['rules'];
	attrib = program.attributes['aPos'];
	ebuffer = ebuffers['rule'];
	proj = program.matrices['uProj'];
	trans = program.matrices['uTrans'];
	color = program.uniforms['uColor'];
	let offset = program.uniforms['uOffset'];
	let uni_scale = program.uniforms['uScale'];

	gl.useProgram(program.loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers['axis']);
	gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
	gl.enableVertexAttribArray(attrib.loc);
	gl.enable(gl.DEPTH_TEST)
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuffer);

	// draw the x rules
	gl.uniformMatrix4fv(trans.loc, false, xtrans);
	gl.uniformMatrix4fv(proj.loc, false, cam_mat);
	color.func(color.loc, colorX);

	let rule = Math.exp(Math.floor(Math.log10(1.0 / obj_s) - 1) * log10);

	let s = Math.ceil((obj_t[0] - .9 / obj_s) / rule);
	let e = Math.floor((obj_t[0] + .9 / obj_s) / rule);

	for (let o = s; o <= e; o++)
	{
		uni_scale.func(uni_scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
		offset.func(offset.loc, [(o * rule - obj_t[0]) * obj_s]);
		gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
	}

	// draw the y rules
	gl.uniformMatrix4fv(trans.loc, false, ytrans);
	gl.uniformMatrix4fv(proj.loc, false, cam_mat);
	color.func(color.loc, colorY);

	s = Math.ceil((obj_t[1] - .9 / obj_s) / rule);
	e = Math.floor((obj_t[1] + .9 / obj_s) / rule);

	for (let o = s; o <= e; o++)
	{
		uni_scale.func(uni_scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
		offset.func(offset.loc, [(o * rule - obj_t[1]) * obj_s]);
		gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
	}


	// draw the x rules
	gl.uniformMatrix4fv(trans.loc, false, ztrans);
	gl.uniformMatrix4fv(proj.loc, false, cam_mat);
	color.func(color.loc, colorZ);

	s = Math.ceil((obj_t[2] - .9 / obj_s) / rule);
	e = Math.floor((obj_t[2] + .9 / obj_s) / rule);

	for (let o = s; o <= e; o++)
	{
		uni_scale.func(uni_scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
		offset.func(offset.loc, [(o * rule - obj_t[2]) * obj_s]);
		gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
	}
}

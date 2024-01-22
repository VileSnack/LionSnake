class LsmAxes
{
	constructor() {
		this.hidden = false;
		this.delete = false;
		this.xcolor = new Float32Array([1,0,0,1]);
		this.ycolor = new Float32Array([0,1,0,1]);
		this.zcolor = new Float32Array([0,0,1,1]);
	}

	// Replace with the function that will render the specific object
	render(data)
	{
		// build some flipping transforms
		const xtrans = new Float32Array(m_rot);
		const ytrans = new Float32Array([ m_rot[4],m_rot[5],m_rot[6],0, m_rot[8],m_rot[9],m_rot[10],0, m_rot[0],m_rot[1],m_rot[2],0, 0,0,0,1 ]);
		const ztrans = new Float32Array([ m_rot[8],m_rot[9],m_rot[10],0, m_rot[0],m_rot[1],m_rot[2],0, m_rot[4],m_rot[5],m_rot[6],0, 0,0,0,1 ]);
		
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
		gl.uniformMatrix4fv(proj.loc, false, c2f);

		// draw the x axis
		color.func(color.loc, this.xcolor);
		gl.uniformMatrix4fv(trans.loc, false, xtrans);
		gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

		// draw the y axis
		color.func(color.loc, this.ycolor);
		gl.uniformMatrix4fv(trans.loc, false, ytrans);
		gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

		// draw the z axis
		color.func(color.loc, this.zcolor);
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
		let scale = program.uniforms['uScale'];

		gl.useProgram(program.loc);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers['axis']);
		gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
		gl.enableVertexAttribArray(attrib.loc);
		gl.enable(gl.DEPTH_TEST)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuffer);

		// draw the x rules
		gl.uniformMatrix4fv(trans.loc, false, xtrans);
		gl.uniformMatrix4fv(proj.loc, false, c2f);
		color.func(color.loc, this.xcolor);

		let rule = Math.exp(Math.floor(Math.log10(1.0 / zoom) - 1) * log10);

		let s = Math.ceil((p_eye[0] - .9 / zoom) / rule);
		let e = Math.floor((p_eye[0] + .9 / zoom) / rule);

		for (let o = s; o <= e; o++)
		{
			scale.func(scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
			offset.func(offset.loc, [(o * rule - p_eye[0]) * zoom]);
			gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
		}

		// draw the y rules
		gl.uniformMatrix4fv(trans.loc, false, ytrans);
		gl.uniformMatrix4fv(proj.loc, false, c2f);
		color.func(color.loc, this.ycolor);

		s = Math.ceil((p_eye[1] - .9 / zoom) / rule);
		e = Math.floor((p_eye[1] + .9 / zoom) / rule);

		for (let o = s; o <= e; o++)
		{
			scale.func(scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
			offset.func(offset.loc, [(o * rule - p_eye[1]) * zoom]);
			gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
		}


		// draw the x rules
		gl.uniformMatrix4fv(trans.loc, false, ztrans);
		gl.uniformMatrix4fv(proj.loc, false, c2f);
		color.func(color.loc, this.zcolor);

		s = Math.ceil((p_eye[2] - .9 / zoom) / rule);
		e = Math.floor((p_eye[2] + .9 / zoom) / rule);

		for (let o = s; o <= e; o++)
		{
			scale.func(scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
			offset.func(offset.loc, [(o * rule - p_eye[2]) * zoom]);
			gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
		}

	}

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

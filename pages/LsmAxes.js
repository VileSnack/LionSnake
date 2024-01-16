class LsmAxes
{
	constructor() {
		this.hidden = false;
		this.delete = false;
		this.xcolor = new Float32Array([1,0,0,1]);
		this.ycolor = new Float32Array([0,1,0,1]);
		this.zcolor = new Float32Array([0,0,1,1]);
		this.xtrans = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		this.ytrans = new Float32Array([0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1]);
		this.ztrans = new Float32Array([0,0,1,0, 1,0,0,0, 0,1,0,0, 0,0,0,1]);
	}

	// Replace with the function that will render the specific object
	render(data)
	{
		const program = programs['solid'];
		const attrib = program.attributes['aPos'];
		const buffer = buffers['axis'];
		const ebuffer = ebuffers['axis'];
		const uni = program.uniforms['uColor'];
		const proj = program.matrices['uProj'];
		const trans = program.matrices['uTrans'];

		// draw the x axis
		gl.useProgram(program.loc);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
		gl.enableVertexAttribArray(attrib.loc);
		uni.func(uni.loc, this.xcolor);
		gl.uniformMatrix4fv(trans.loc, false, this.xtrans);
		gl.uniformMatrix4fv(proj.loc, false, new Float32Array(pers));
		gl.enable(gl.DEPTH_TEST)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebuffer);
		gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

		// draw the y axis

		uni.func(uni.loc, this.ycolor);
		gl.uniformMatrix4fv(trans.loc, false, this.ytrans);
		gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);

		// draw the z axis
		uni.func(uni.loc, this.zcolor);
		gl.uniformMatrix4fv(trans.loc, false, this.ztrans);
		gl.drawElements(gl.LINES, 18, gl.UNSIGNED_SHORT, 0);
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

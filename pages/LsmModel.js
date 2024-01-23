class LsmModel {
	constructor (data)
	{
		this.verts = [...data.verts];
		this.buffer = null;
		this.count = 0;
	}

	render()
	{
		//------------------------------------------------------------------------------------------
		// Build the buffer if we haven't already done so.
		//
		if (!this.buffer)
		{
			const data = [];
			this.count = 0;
			this.buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

			verts.forEach(vert => {
				data.push(vert.x, vert.y, vert.z);
				this.count++;
			});

			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		}

		let program = programs['verts'];
		let attrib = program.attributes['aPos'];
		let ebuffer = ebuffers['axis'];
		let color = program.uniforms['uColor'];
		let size = program.uniforms['uSize'];
		let proj = program.matrices['uProj'];
		let trans = program.matrices['uTrans'];

		gl.useProgram(program.loc);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
		gl.enableVertexAttribArray(attrib.loc);
		gl.enable(gl.DEPTH_TEST)
		gl.uniformMatrix4fv(proj.loc, false, c2f);

		color.func(color.loc, [1,1,1,1]);
		size.func(size.loc, [3]);
		gl.uniformMatrix4fv(trans.loc, false,
			[
				m_rot[0] * zoom, m_rot[1] * zoom, m_rot[2] * zoom, 0,
				m_rot[4] * zoom, m_rot[5] * zoom, m_rot[6] * zoom, 0,
				m_rot[8] * zoom, m_rot[9] * zoom, m_rot[10] * zoom, 0,
				p_eye[0], p_eye[1], p_eye[2], 1
			]
		);
		gl.drawArrays(gl.POINTS,0, this.count);
	}
}

/* verts: [
	{
		x: number,
		y: number,
		z: number,
		i: number // used for generating output files
	} ,
	...
];
*/

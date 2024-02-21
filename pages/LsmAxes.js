const colorX = new Float32Array([1,0,0,1]);
const colorY = new Float32Array([0,1,0,1]);
const colorZ = new Float32Array([0,0,1,1]);

class LsmAxes
{
	static vertexBuffers = [
		{
			attributes: [
				{
					shaderLocation: 0,
					offset: 0,
					format: "float32x4",
				},
				{
					shaderLocation: 1,
					offset: 16,
					format: "float32x4",
				}
			],
			arrayStride: 32,
			stepMode: "vertex"
		}
	];

	constructor()
	{
		this.scale = 1;
		this.rotate = [1,0,0, 0,1,0, 0,0,1];
		this.translate = [0,0,0];
		this.show = true;

		this.transBuffer = device.createBuffer({
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});

		device.queue.writeBuffer(this.transBuffer, 0, new Float32Array(identity));

		//----------------------------------------------------------------------------------------------
		// Create the render pipeline for this render pass.
		//
		const pipelineDescriptor = {
			vertex: {
				module: modules['mono'],
				entryPoint: 'vertex_main',
				buffers: LsmAxes.vertexBuffers,
			},
			fragment: {
				module: modules['mono'],
				entryPoint: 'fragment_main',
				targets: [
					{
						format: navigator.gpu.getPreferredCanvasFormat(),
					},
				],
			},
			primitive: {
				topology: 'line-list'
			},
			layout: 'auto'
		};

		this.pipeline = device.createRenderPipeline(pipelineDescriptor);

		this.bindGroup = device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: this.transBuffer }},
				{ binding: 1, resource: { buffer: c2fBuffer }}
			],
		});
	}

	setScale(newScale) { this.scale = newScale; }

	setRotate(newRotate)
	{
		this.rotate = [...newRotate];
		device.queue.writeBuffer(this.transBuffer, 0, new Float32Array([
			newRotate[0],	newRotate[1],	newRotate[2],	0,
			newRotate[3],	newRotate[4],	newRotate[5],	0,
			newRotate[6],	newRotate[7],	newRotate[8],	0,
			0,				0,				0,				1
		]));
	}

	setTranslate(newTranslate) { this.translate = [...newTranslate]; }

	setShow(newShow) { this.show = newShow; }

	render(encoder)
	{
		if (!this.show) return;

		const iset = index_sets['axes'];

		encoder.setPipeline(this.pipeline);
		encoder.setBindGroup(0, this.bindGroup);
		encoder.setVertexBuffer(0, vertex_sets['axes'].buffer);
		encoder.setIndexBuffer(iset.buffer, iset.type);
		encoder.drawIndexed(iset.count);

/*
		// draw the rules
		program = programs['rules'];
		attrib = program.attributes['aPos'];
		o_buffer = ebuffers['origin'];
		r_buffer = ebuffers['rule'];
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

		// draw the x rules
		gl.uniformMatrix4fv(trans.loc, false, xtrans);
		gl.uniformMatrix4fv(proj.loc, false, cam_mat);
		color.func(color.loc, colorX);

		let rule = Math.exp(Math.floor(Math.log10(1.0 / obj_s) - 1) * log10);

		let s = Math.ceil((obj_t[0] - .9 / obj_s) / rule);
		let e = Math.floor((obj_t[0] + .9 / obj_s) / rule);

		for (let o = s; o <= e; o++)
		{
			offset.func(offset.loc, [(o * rule - obj_t[0]) * obj_s]);

			if (0 === o)
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o_buffer);
				uni_scale.func(uni_scale.loc, [ .02 ]);
				gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_SHORT, 0);
			}
			else
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r_buffer);
				uni_scale.func(uni_scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
				gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
			}
		}

		// draw the y rules
		gl.uniformMatrix4fv(trans.loc, false, ytrans);
		gl.uniformMatrix4fv(proj.loc, false, cam_mat);
		color.func(color.loc, colorY);

		s = Math.ceil((obj_t[1] - .9 / obj_s) / rule);
		e = Math.floor((obj_t[1] + .9 / obj_s) / rule);

		for (let o = s; o <= e; o++)
		{
			offset.func(offset.loc, [(o * rule - obj_t[1]) * obj_s]);

			if (0 === o)
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o_buffer);
				uni_scale.func(uni_scale.loc, [.02]);
				gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_SHORT, 0);
			}
			else
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r_buffer);
				uni_scale.func(uni_scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
				gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
			}
		}


		// draw the x rules
		gl.uniformMatrix4fv(trans.loc, false, ztrans);
		gl.uniformMatrix4fv(proj.loc, false, cam_mat);
		color.func(color.loc, colorZ);

		s = Math.ceil((obj_t[2] - .9 / obj_s) / rule);
		e = Math.floor((obj_t[2] + .9 / obj_s) / rule);

		for (let o = s; o <= e; o++)
		{
			offset.func(offset.loc, [(o * rule - obj_t[2]) * obj_s]);

			if (0 === o)
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o_buffer);
				uni_scale.func(uni_scale.loc, [ .02 ]);
				gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_SHORT, 0);
			}
			else
			{
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r_buffer);
				uni_scale.func(uni_scale.loc, [(o % 10 === 0) ? .03 : (o % 5 === 0) ? .02 : .01]);
				gl.drawElements(gl.LINES, 4, gl.UNSIGNED_SHORT, 0);
			}
		}
*/
	}
}

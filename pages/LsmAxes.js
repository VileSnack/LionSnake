const colorX = [1,0,0,1];
const colorY = [0,1,0,1];
const colorZ = [0,0,1,1];

class LsmAxes
{
	static vertexBuffers = [
		{
			attributes: [
				{
					shaderLocation: 0,
					offset: 0,
					format: "float32x4",
				}
			],
			arrayStride: 16,
			stepMode: "vertex"
		},
		{
			attributes: [
				{
					shaderLocation: 1,
					offset: 0,
					format: "float32x4",
				},
				{
					shaderLocation: 2,
					offset: 16,
					format: "float32x4",
				},
				{
					shaderLocation: 3,
					offset: 32,
					format: "float32x4",
				},
				{
					shaderLocation: 4,
					offset: 48,
					format: "float32x4",
				},
				{
					shaderLocation: 5,
					offset: 64,
					format: "float32x4",
				}
			],
			arrayStride: 80,
			stepMode: "instance"
		}
	];

	constructor()
	{
		this.scale = 1;
		this.rotate = [1,0,0, 0,1,0, 0,0,1];
		this.translate = [0,0,0];
		this.show = true;

		this.axisInstanceBuffer = device.createBuffer({
			size: 240,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		this.gratInstanceBuffer = device.createBuffer({
			size: 240,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		this.setRotate([1,0,0, 0,1,0, 0,0,1]);

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
						format: navigator.gpu.getPreferredCanvasFormat()
					}
				]
			},
			primitive: {
				topology: 'line-list'
			},
			layout: 'auto',
			depthStencil: {
				depthWriteEnabled: true,
				depthCompare: "less",
				format: "depth24plus",
			}
		};

		this.pipeline1 = device.createRenderPipeline(pipelineDescriptor);
		this.pipeline2 = device.createRenderPipeline(pipelineDescriptor);

		this.bindGroup1 = device.createBindGroup({
			layout: this.pipeline1.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: c2fBuffer }}
			],
		});

		this.bindGroup2 = device.createBindGroup({
			layout: this.pipeline2.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: c2fBuffer }}
			],
		});
	}

	setAxisTransforms()
	{
		device.queue.writeBuffer(this.axisInstanceBuffer, 0, new Float32Array([
			this.rotate[0],	this.rotate[1],	this.rotate[2],	0,
			this.rotate[3],	this.rotate[4],	this.rotate[5],	0,
			this.rotate[6],	this.rotate[7],	this.rotate[8],	0,
			0,				0,				0,				1,
			...colorX,
			this.rotate[3],	this.rotate[4],	this.rotate[5],	0,
			this.rotate[6],	this.rotate[7],	this.rotate[8],	0,
			this.rotate[0],	this.rotate[1],	this.rotate[2],	0,
			0,				0,				0,				1,
			...colorY,
			this.rotate[6],	this.rotate[7],	this.rotate[8],	0,
			this.rotate[0],	this.rotate[1],	this.rotate[2],	0,
			this.rotate[3],	this.rotate[4],	this.rotate[5],	0,
			0,				0,				0,				1,
			...colorZ
		]));

		device.queue.writeBuffer(this.gratInstanceBuffer, 0, new Float32Array([
			this.rotate[0],	this.rotate[1],	this.rotate[2],	0,
			this.rotate[3],	this.rotate[4],	this.rotate[5],	0,
			this.rotate[6],	this.rotate[7],	this.rotate[8],	0,
			-this.translate[0] * this.scale * this.rotate[0],				-this.translate[0] * this.scale * this.rotate[1],				-this.translate[0] * this.scale * this.rotate[2],				1,
			...colorX,
			this.rotate[3],	this.rotate[4],	this.rotate[5],	0,
			this.rotate[6],	this.rotate[7],	this.rotate[8],	0,
			this.rotate[0],	this.rotate[1],	this.rotate[2],	0,
			-this.translate[1] * this.scale * this.rotate[3],				-this.translate[1] * this.scale * this.rotate[4],				-this.translate[1] * this.scale * this.rotate[5],				1,
			...colorY,
			this.rotate[6],	this.rotate[7],	this.rotate[8],	0,
			this.rotate[0],	this.rotate[1],	this.rotate[2],	0,
			this.rotate[3],	this.rotate[4],	this.rotate[5],	0,
			-this.translate[2] * this.scale * this.rotate[6],				-this.translate[2] * this.scale * this.rotate[7],				-this.translate[2] * this.scale * this.rotate[8],				1,
			...colorZ
		]));
	}

	setScale(newScale) {
		this.scale = newScale;
		this.setAxisTransforms();
	}

	setRotate(newRotate)
	{
		this.rotate = [...newRotate];
		this.setAxisTransforms();
	}

	setTranslate(newTranslate)
	{
		this.translate = [...newTranslate];
		this.setAxisTransforms();
	}

	setShow(newShow) { this.show = newShow; }

	render(encoder)
	{
		if (!this.show) return;

		let iset = index_sets['axes'];

		encoder.setPipeline(this.pipeline1);
		encoder.setBindGroup(0, this.bindGroup1);
		encoder.setVertexBuffer(0, vertex_sets['axes'].buffer);
		encoder.setVertexBuffer(1, this.axisInstanceBuffer);
		encoder.setIndexBuffer(iset.buffer, iset.type);
		encoder.drawIndexed(iset.count, 3);

		iset = index_sets['grat'];

		encoder.setPipeline(this.pipeline2);
		encoder.setBindGroup(0, this.bindGroup2);
		encoder.setVertexBuffer(0, vertex_sets['grat'].buffer);
		encoder.setVertexBuffer(1, this.gratInstanceBuffer);
		encoder.setIndexBuffer(iset.buffer, iset.type);
		encoder.drawIndexed(iset.count, 3);

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

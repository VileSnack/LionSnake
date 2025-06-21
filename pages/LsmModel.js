class LsmModel extends LsmProject
{
	static index = 1;

	constructor (params)
	{
		super(params);
		this.verts = [];
		this.edges = [];
		this.faces = [];
		this.vbuffer = null;	// The vertex buffer, for drawing vertices alone
		this.ebuffer = null;	// The edge buffer, defines edge entities
		this.fbuffer = null;	// The fully-shaded vertex buffer
		this.tbuffer = null;	// The triangle buffer, defines triangle entities
		this.vcount = 0;
		this.ecount = 0;
		this.tcount = 0;
		this.view = new LsmView({ handedness: this.handedness, sAngle: 19 });
		this.view.recalc();
		this.name = 'Model' + LsmModel.index++;
		this.obj_s = this.view.sZoom;
		this.obj_s_save = this.obj_s;
		this.obj_r = [...this.view.vRight, ...this.view.vUp, ...this.view.vDirection];
		this.obj_r_save = [...this.obj_r];
		this.obj_t = [...this.view.pLookAt];
		this.obj_t_save = [...this.obj_t];
		this.downX = 0;
		this.downY = 0;
		this.vhover = [];
		this.width = 1;
		this.height = 1;
		this.axes = new LsmAxes();
	}

	addObject()
	{
		let vcount = this.verts.length;
		let ecount = this.edges.length;

		switch (document.add_object.type.value)
		{
			case 'box':
			{
				const scaleX = +document.add_object.scale_x.value;
				const scaleY = +document.add_object.scale_y.value;
				const scaleZ = +document.add_object.scale_z.value;
				this.verts.push(
					{ x: -scaleX, y: -scaleY, z: -scaleZ },
					{ x:  scaleX, y: -scaleY, z: -scaleZ },
					{ x: -scaleX, y:  scaleY, z: -scaleZ },
					{ x:  scaleX, y:  scaleY, z: -scaleZ },
					{ x: -scaleX, y: -scaleY, z:  scaleZ },
					{ x:  scaleX, y: -scaleY, z:  scaleZ },
					{ x: -scaleX, y:  scaleY, z:  scaleZ },
					{ x:  scaleX, y:  scaleY, z:  scaleZ }
				);
				this.edges.push(
					{ s: this.verts[vcount + 0], e: this.verts[vcount + 1] },
					{ s: this.verts[vcount + 2], e: this.verts[vcount + 3] },
					{ s: this.verts[vcount + 4], e: this.verts[vcount + 5] },
					{ s: this.verts[vcount + 6], e: this.verts[vcount + 7] },
					{ s: this.verts[vcount + 0], e: this.verts[vcount + 2] },
					{ s: this.verts[vcount + 1], e: this.verts[vcount + 3] },
					{ s: this.verts[vcount + 4], e: this.verts[vcount + 6] },
					{ s: this.verts[vcount + 5], e: this.verts[vcount + 7] },
					{ s: this.verts[vcount + 0], e: this.verts[vcount + 4] },
					{ s: this.verts[vcount + 1], e: this.verts[vcount + 5] },
					{ s: this.verts[vcount + 2], e: this.verts[vcount + 6] },
					{ s: this.verts[vcount + 3], e: this.verts[vcount + 7] }
				);

				this.faces.push(
					{ e:[this.edges[ecount + 0], this.edges[ecount + 4],this.edges[ecount + 1],this.edges[ecount + 5]], c:[.75,.75,.75,1] },
					{ e:[this.edges[ecount + 2], this.edges[ecount + 7],this.edges[ecount + 3],this.edges[ecount + 6]], c:[.75,.75,.75,1] },
					{ e:[this.edges[ecount + 0], this.edges[ecount + 9],this.edges[ecount + 2],this.edges[ecount + 8]], c:[.75,.75,.75,1] },
					{ e:[this.edges[ecount + 1], this.edges[ecount + 10],this.edges[ecount + 3],this.edges[ecount + 11]], c:[.75,.75,.75,1] },
					{ e:[this.edges[ecount + 4], this.edges[ecount + 8],this.edges[ecount + 6],this.edges[ecount + 10]], c:[.75,.75,.75,1] },
					{ e:[this.edges[ecount + 5], this.edges[ecount + 11],this.edges[ecount + 7],this.edges[ecount + 9]], c:[.75,.75,.75,1] }
				);
				this.obj_s = .5 / Math.max(scaleX, scaleY, scaleZ);
				this.obj_t = [0,0,0];
				this.rebuild();
				this.recalcHoverPoints();
			}
			break;
		}
	}

	dumpData()
	{
		console.log(`verts: ${this.verts}`);
		console.log(`edges: ${this.edges}`);
		console.log(`faces: ${this.faces}`);
		console.log(`mouseMode: ${this.mouseMode}`);
	}

	rebuild()
	{
		const vdata = [];
		let count = 0;

		this.verts.forEach(vert => {
			vert.i = count++;
			vdata.push(vert.x, vert.y, vert.z);
		});

		this.vcount = vdata.length;

		this.vbuffer = device.createBuffer({
			size: this.vcount * 12,	// 3 floats per vertex, 4 bytes per float
			label: 'vertex buffer for a model',
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});
		device.queue.writeBuffer(this.vbuffer, 0, new Float32Array(vdata));

/*
		const edata = [];

		this.edges.forEach(edge => {
			edata.push(edge.s.i, edge.e.i);
		});

		this.ecount = edata.length;

		this.ebuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(edata), gl.STATIC_DRAW);

		const fdata = [];
		const tdata = [];

		count = 0;

		this.faces.forEach(face => {
			const verts = [];

			face.e.forEach((edge, index, e) => {
				if (0 === index)
				{
					//------------------------------------------------------------------------------
					// For the first edge, push the vertex that isn't in the following edge.
					//
					if ((edge.e === e[1].s) || (edge.e === e[1].e))
					{
						verts.push(edge.s);
					}
					else
					{
						verts.push(edge.e);
					}
				}
				else
				{
					//------------------------------------------------------------------------------
					// For the remaining edges, push the vertex that is in the preceding edge.
					//
					if ((edge.s === e[index - 1].s) || (edge.s === e[index - 1].e))
					{
						verts.push(edge.s);
					}
					else
					{
						verts.push(edge.e);
					}
				}
			});

			let norm = [0,0,0];

			for (let i = 0; i < verts.length; i++)
			{
				const j = (i + 1) % verts.length;

				norm[0] += verts[i].y * verts[j].z - verts[i].z * verts[j].y;
				norm[1] += verts[i].z * verts[j].x - verts[i].x * verts[j].z;
				norm[2] += verts[i].x * verts[j].y - verts[i].y * verts[j].x;
			}

			norm = vnormalize(norm);

			const start = count;

			verts.forEach((vert) => {
				fdata.push(vert.x, vert.y, vert.z, ...norm, ...face.c);
				count++;
			});

			for (let i = 1; i < verts.length - 1; i++)
			{
				tdata.push(start + 0, start + i, start + i + 1);
			}
		});

		this.fbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.fbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fdata), gl.STATIC_DRAW);

		this.tcount = tdata.length;

		this.tbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.tbuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(tdata), gl.STATIC_DRAW);
*/
		if (document.toolbar?.mode.value === 'sel')
		{
			this.recalcHoverPoints();
		}
	}

	recalcCamera()
	{
		this.view.recalc();
	}

	recalcHoverPoints()
	{
		// this.verts.forEach((vert) => {
			// let loc = [(vert.x - this.obj_t[0]) * this.obj_s, (vert.y - this.obj_t[1]) * this.obj_s, (vert.z - this.obj_t[2]) * this.obj_s];
			// loc = [
				// loc[0] * this.obj_r[0] + loc[1] * this.obj_r[3] + loc[2] * this.obj_r[6],
				// loc[0] * this.obj_r[1] + loc[1] * this.obj_r[4] + loc[2] * this.obj_r[7],
				// loc[0] * this.obj_r[2] + loc[1] * this.obj_r[5] + loc[2] * this.obj_r[8]
			// ];
			// console.log(this.cam_proj);
			// loc = [
				// loc[0] * this.cam_proj[0] + loc[1] * this.cam_proj[4] + loc[2] * this.cam_proj[8] + this.cam_proj[12],
				// loc[0] * this.cam_proj[1] + loc[1] * this.cam_proj[5] + loc[2] * this.cam_proj[9] + this.cam_proj[13],
				// loc[0] * this.cam_proj[2] + loc[1] * this.cam_proj[6] + loc[2] * this.cam_proj[10] + this.cam_proj[14],
				// loc[0] * this.cam_proj[3] + loc[1] * this.cam_proj[7] + loc[2] * this.cam_proj[11] + this.cam_proj[15]
			// ];
			// if (loc[3] !== 0)
			// {
				// vert.pX = Math.floor((loc[0] / loc[3] + 1) * .5 * canvas.width +.5);
				// vert.pY = Math.floor((1 - loc[1] / loc[3]) * .5 * canvas.height +.5);
				// vert.depth = loc[3];
			// }
			// else
			// {
				// vert.pX = -1e6;
				// vert.pY = -1e6;
			// }
		// });
	}

	render(encoder, time)
	{
		if (this.width !== canvas.width || this.height !== canvas.height)
		{
			this.view.recalc();
			this.width = canvas.width;
			this.height = canvas.height;
		}

		this.axes.render(encoder);

/*
		if (this.vbuffer)
		{
			let program = programs['verts'];
			let aPos = program.attributes['aPos'];
			let uColor = program.uniforms['uColor'];
			let uSize = program.uniforms['uSize'];
			let uProj = program.matrices['uProj'];
			let uTrans = program.matrices['uTrans'];

			gl.useProgram(program.loc);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
			gl.vertexAttribPointer(aPos.loc, aPos.len, aPos.type, false, aPos.stride, aPos.offset);
			gl.enableVertexAttribArray(aPos.loc);
			gl.enable(gl.DEPTH_TEST)
			gl.uniformMatrix4fv(uProj.loc, false, this.cam_proj);

			const mat_t = [...identity];
			multiply( [1,0,0,0, 0,1,0,0, 0,0,1,0, -this.obj_t[0], -this.obj_t[1], -this.obj_t[2], 1 ],
				[
					this.obj_r[0] * this.obj_s, this.obj_r[1] * this.obj_s, this.obj_r[2] * this.obj_s, 0,
					this.obj_r[3] * this.obj_s, this.obj_r[4] * this.obj_s, this.obj_r[5] * this.obj_s, 0,
					this.obj_r[6] * this.obj_s, this.obj_r[7] * this.obj_s, this.obj_r[8] * this.obj_s, 0,
					0, 0, 0, 1
				],
				mat_t
			);
			gl.uniformMatrix4fv(uTrans.loc, false, mat_t);

			//--------------------------------------------------------------------------------------
			// Draw the highlighted vertices.
			//
			if (this.vhover)
			{
				const hbuffer = gl.createBuffer();
				const indices = [this.vhover.i];
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hbuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), gl.STATIC_DRAW);
				uColor.func(uColor.loc, [1,1,0,1]);
				uSize.func(uSize.loc, [7]);
				gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 0);
			}

			//--------------------------------------------------------------------------------------
			// Draw the vertices.
			//
			uColor.func(uColor.loc, [1,1,1,1]);
			uSize.func(uSize.loc, [3]);
			gl.drawArrays(gl.POINTS,0, this.verts.length);

			//--------------------------------------------------------------------------------------
			// Draw the edges.
			//
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebuffer);
			gl.drawElements(gl.LINES, this.ecount, gl.UNSIGNED_SHORT, 0);

			//--------------------------------------------------------------------------------------
			// Draw the triangles.
			//
			program = programs['faces'];
			aPos = program.attributes['aPos'];
			let aNorm = program.attributes['aNorm'];
			let aColor = program.attributes['aColor'];
			uProj = program.matrices['uProj'];
			uTrans = program.matrices['uTrans'];
			let uRot = program.matrices['uRot'];

			gl.useProgram(program.loc);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.fbuffer);

			gl.vertexAttribPointer(aPos.loc, aPos.len, aPos.type, false, aPos.stride, aPos.offset);
			gl.enableVertexAttribArray(aPos.loc);
			gl.vertexAttribPointer(aNorm.loc, aNorm.len, aNorm.type, false, aNorm.stride, aNorm.offset);
			gl.enableVertexAttribArray(aNorm.loc);
			gl.vertexAttribPointer(aColor.loc, aColor.len, aColor.type, false, aColor.stride, aColor.offset);
			gl.enableVertexAttribArray(aColor.loc);

			gl.uniformMatrix4fv(uProj.loc, false, this.cam_proj);
			gl.uniformMatrix4fv(uTrans.loc, false, mat_t);
			gl.uniformMatrix4fv(uRot.loc, false, [
				this.obj_r[0], this.obj_r[1], this.obj_r[2], 0,
				this.obj_r[3], this.obj_r[4], this.obj_r[5], 0,
				this.obj_r[6], this.obj_r[7], this.obj_r[8], 0,
				0,0,0,1]
			);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.tbuffer);
			gl.drawElements(gl.TRIANGLES, this.tcount, gl.UNSIGNED_SHORT, 0);
		}
*/
	}

	setToolbar()
	{
		document.querySelector('#toolbar').innerHTML = '<form name="toolbar">'
		+ '<a class="button small hovertext" id="button-new-project" onclick="showPopup(\'popup-new-project\');" hover-text="New Project">New</a><br/>'
		+ '<a class="button red hovertext" onclick="thisProject.xneg();" hover-text="View from right">X&ndash;</a><br/>'
		+ '<a class="button red hovertext" onclick="thisProject.xpos();" hover-text="View from left">X+</a><br/>'
		+ '<a class="button green hovertext" id="view-yneg" onclick="thisProject.yneg();">Y&ndash;</a><br/>'
		+ '<a class="button green hovertext" id="view-ypos" onclick="thisProject.ypos();">Y+</a><br/>'
		+ '<a class="button blue hovertext" id="view-zneg" onclick="thisProject.zneg();">Z&ndash;</a><br/>'
		+ '<a class="button blue hovertext" id="view-zpos" onclick="thisProject.zpos();">Z+</a><br/>'
		+ '<label class="customcheck"><input type="checkbox" name="pers" onchange="thisProject.recalcCamera();"/><span class="hovertext" hover-text="Toggle perspective">P</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="p" checked onclick="thisProject.recalcHoverPoints(); thisProject.mouseMode = \'p\';"/><span class="small hovertext" hover-text="Select">Sel</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="s" onclick="thisProject.mouseMode = \'s\';" /><span class="hovertext" hover-text="Scale">S</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="r" onclick="thisProject.mouseMode = \'r\';" /><span class="hovertext" hover-text="Rotate">R</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="t" onclick="thisProject.mouseMode = \'t\';" /><span class="hovertext" hover-text="Translate">T</span></label><br/>'
		+ '<a class="button hovertext" id="view-origin" onclick="thisProject.toOrigin();" hover-text="Snap to origin">O</a><br/>'
		+ '<a class="button small hovertext" id="edit-add" onclick="showPopup(\'add-popup\');" hover-text="Add gemoetry to model">Add</a><br/>'
		+ '<a class="button small hovertext" id="dump-data" onclick="thisProject.dumpData();" hover-text="Dump mesh data">...</a><br/>'
		+ '<span class="small" id="w"></span><br/>'
		+ '<span class="small" id="h"></span><br/>'
		+ '</form>';

		if ('l' === this.handedness)
		{
			document.querySelector('#view-yneg').setAttribute('hover-text', 'View from above');
			document.querySelector('#view-ypos').setAttribute('hover-text', 'View from below');
			document.querySelector('#view-zneg').setAttribute('hover-text', 'View from front');
			document.querySelector('#view-zpos').setAttribute('hover-text', 'View from back');
		}
		else
		{
			document.querySelector('#view-yneg').setAttribute('hover-text', 'View from front');
			document.querySelector('#view-ypos').setAttribute('hover-text', 'View from back');
			document.querySelector('#view-zneg').setAttribute('hover-text', 'View from above');
			document.querySelector('#view-zpos').setAttribute('hover-text', 'View from below');
		}

		this.cam_proj = this.view.recalc();
		this.mouseMode = document.toolbar.mode.value;
	}

	onContextMenu(event) {}
	onMouseClick(event) {}

	onMouseDown(e)
	{
		this.downX = e.offsetX;
		this.downY = e.offsetY;

		this.mouseMode = 'd_' + document.toolbar.mode.value;

		switch (this.mouseMode)
		{
			case 'd_s':
				this.obj_s_save = this.obj_s;
			break;
			case 'd_r':
				this.obj_r_save = [...this.obj_r];
			break;
			case 'd_t':
				this.obj_t_save = [...this.obj_t];
			break;
			case 'd_p':
				if (this.vhover)
				{
					this.vhover.save_x = this.vhover.x;
					this.vhover.save_y = this.vhover.y;
					this.vhover.save_z = this.vhover.z;
					// TODO: Calculate position based on mouse location and average depth of selected vertices
				}
			break;
		}
	}

	onMouseUp(e)
	{
		this.recalcHoverPoints();
		this.mouseMode = '';
		this.vhover = null;
	}

	onMouseMove(e)
	{
		const mX = e.offsetX;
		const mY = e.offsetY;

		switch (this.mouseMode)
		{
			case 'd_s':
				const centerX = canvas.width / 2;
				const centerY = canvas.height / 2;
				const dx1 = this.downX - centerX;
				const dy1 = this.downY - centerY;
				const dx2 = mX - centerX;
				const dy2 = mY - centerY;
				const mag1 = dx1 * dx1 + dy1 * dy1;
				const mag2 = dx2 * dx2 + dy2 * dy2;
				if (mag2 !== 0) this.obj_s = Math.max(1e-6, Math.min(1e3,this.obj_s_save * Math.sqrt(mag2 / mag1)));

				this.axes.setScale(this.obj_s);
			break;
			case 'd_r':
				const aX = this.downY - mY;
				const aY = this.downX - mX;
				const mag = Math.sqrt(aX * aX + aY * aY);

				if (0 === mag)
				{
					this.obj_r = [...this.obj_r_save];
				}
				else
				{
					const u = aX / mag;
					const v = aY / mag;
					const c = Math.cos(mag * .01);
					const s = Math.sin(mag * .01);

					this.obj_r = mat3_multiply(this.obj_r_save,
						[
							u * u + c * v * v, u * v - c * u * v, -s * v,
							u * v - c * u * v, v * v + c * u * u, s * u,
							s * v, -s * u, c
						]
					);
				}

				this.axes.setRotate(this.obj_r);
			break;
			case 'd_t':
				const d = Math.min(canvas.width, canvas.height);
				const dx = (mX - this.downX) / d * 2 / this.obj_s;
				const dy = (this.downY - mY) / d * 2 / this.obj_s;
				this.obj_t = [
					this.obj_t_save[0] - this.obj_r[0] * dx - this.obj_r[1] * dy,
					this.obj_t_save[1] - this.obj_r[3] * dx - this.obj_r[4] * dy,
					this.obj_t_save[2] - this.obj_r[6] * dx - this.obj_r[7] * dy
				];

				this.axes.setTranslate(this.obj_t);
			break;
			case 'p':
				this.vhover = null;
				this.verts.forEach((vert, index) => {
					vert.i = index;

					if ((mX > vert.pX - 3) && (mX < vert.pX + 3) && (mY > vert.pY - 3) && (mY < vert.pY + 3))
					{
						if ((null === this.vhover)
						|| (this.vhover.depth > vert.depth))
						{
							this.vhover = vert;
						}
					}
				});
			break;

			case 'd_p':
				if (this.vhover)
				{
					// TODO: Calculate position based on mouse location and average depth of selected vertices,
					// and use the difference between that and the value calculated at mousedown for the moving
					const d = Math.min(canvas.width, canvas.height);
					const dx = (mX - this.downX) / d * 2 / this.obj_s;
					const dy = (this.downY - mY) / d * 2 / this.obj_s;
					this.vhover.x = this.vhover.save_x + this.obj_r[0] * dx + this.obj_r[1] * dy,
					this.vhover.y = this.vhover.save_y + this.obj_r[3] * dx + this.obj_r[4] * dy,
					this.vhover.z = this.vhover.save_z + this.obj_r[6] * dx + this.obj_r[7] * dy

					this.rebuild();
				}
				else
				{
					// TODO: rectangle selection of vertices
				}
				
			break;
		}
	}

	toOrigin() { this.obj_t = [0,0,0]; this.axes.setTranslate(this.obj_t); }

	xneg()
	{
		if (this.handedness === 'l')
		{
			this.obj_r = [0,0,-1, 0,1,0, 1,0,0];
		}
		else
		{
			this.obj_r = [0,0,-1, 1,0,0, 0,1,0];
		}

		this.axes.setRotate(this.obj_r);
		this.recalcHoverPoints();
	}

	xpos()
	{
		if (this.handedness === 'l')
		{
			this.obj_r = [0,0,1, 0,1,0, -1,0,0];
		}
		else
		{
			this.obj_r = [0,0,1, -1,0,0, 0,1,0];
		}

		this.axes.setRotate(this.obj_r);
		this.recalcHoverPoints();
	}

	yneg()
	{
		if (this.handedness === 'l')
		{
			this.obj_r = [1,0,0, 0,0,-1, 0,1,0];
		}
		else
		{
			this.obj_r = [-1,0,0, 0,0,-1, 0,1,0];
		}

		this.axes.setRotate(this.obj_r);
		this.recalcHoverPoints();
	}

	ypos()
	{
		if (this.handedness === 'l')
		{
			this.obj_r = [-1,0,0, 0,0,1, 0,1,0];
		}
		else
		{
			this.obj_r = [1,0,0, 0,0,1, 0,1,0];
		}

		this.axes.setRotate(this.obj_r);
		this.recalcHoverPoints();
	}

	zneg()
	{
		if (this.handedness === 'l')
		{
			this.obj_r = [-1,0,0, 0,1,0, 0,0,-1];
		}
		else
		{
			this.obj_r = [1,0,0, 0,1,0, 0,0,-1];
		}

		this.axes.setRotate(this.obj_r);
		this.recalcHoverPoints();
	}

	zpos()
	{
		if (this.handedness === 'l')
		{
			this.obj_r = [1,0,0, 0,1,0, 0,0,1];
		}
		else
		{
			this.obj_r = [-1,0,0, 0,1,0, 0,0,1];
		}

		this.axes.setRotate(this.obj_r);
		this.recalcHoverPoints();
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

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
		this.name = 'Model' + LsmModel.index++;
		this.axesOn = true;
		this.cam_proj = [...identity];
		this.obj_s = this.view.sZoom;
		this.obj_s_save = this.obj_s;
		this.obj_r = [...this.view.vRight, ...this.view.vUp, ...this.view.vDirection];
		this.obj_r_save = [...this.obj_r];
		this.obj_t = [...this.view.pLookAt];
		this.obj_t_save = [...this.obj_t];
		this.downX = 0;
		this.downY = 0;
		this.vhover = [];
	}

	addObject()
	{
		let vcount = this.verts.length;
		let ecount = this.edges.length;

		switch (document.add_object.type.value)
		{
			case 'box':
				this.verts.push(
					{ x: -1, y: -1, z: -1 },
					{ x:  1, y: -1, z: -1 },
					{ x: -1, y:  1, z: -1 },
					{ x:  1, y:  1, z: -1 },
					{ x: -1, y: -1, z:  1 },
					{ x:  1, y: -1, z:  1 },
					{ x: -1, y:  1, z:  1 },
					{ x:  1, y:  1, z:  1 }
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
				this.obj_s = .5;
				this.obj_t = [0,0,0];
				this.rebuild();
			break;
		}
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

		this.vbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vdata), gl.STATIC_DRAW);

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

		if (document.toolbar?.mode.value === 'sel')
		{
			this.recalcHoverPoints();
		}
	}

	recalcCamera()
	{
		this.cam_proj = this.view.recalc();
	}

	recalcHoverPoints()
	{
		this.verts.forEach((vert) => {
			let loc = [(vert.x - this.obj_t[0]) * this.obj_s, (vert.y - this.obj_t[1]) * this.obj_s, (vert.z - this.obj_t[2]) * this.obj_s];
			loc = [
				loc[0] * this.obj_r[0] + loc[1] * this.obj_r[3] + loc[2] * this.obj_r[6],
				loc[0] * this.obj_r[1] + loc[1] * this.obj_r[4] + loc[2] * this.obj_r[7],
				loc[0] * this.obj_r[2] + loc[1] * this.obj_r[5] + loc[2] * this.obj_r[8]
			];
			loc = [
				loc[0] * this.cam_proj[0] + loc[1] * this.cam_proj[4] + loc[2] * this.cam_proj[8] + this.cam_proj[12],
				loc[0] * this.cam_proj[1] + loc[1] * this.cam_proj[5] + loc[2] * this.cam_proj[9] + this.cam_proj[13],
				loc[0] * this.cam_proj[2] + loc[1] * this.cam_proj[6] + loc[2] * this.cam_proj[10] + this.cam_proj[14],
				loc[0] * this.cam_proj[3] + loc[1] * this.cam_proj[7] + loc[2] * this.cam_proj[11] + this.cam_proj[15]
			];
			if (loc[3] !== 0)
			{
				vert.pX = Math.floor((loc[0] / loc[3] + 1) * .5 * gl.canvas.width +.5);
				vert.pY = Math.floor((1 - loc[1] / loc[3]) * .5 * gl.canvas.height +.5);
			}
			else
			{
				vert.pX = -1e6;
				vert.pY = -1e6;
			}
		});
	}

	render()
	{
		if (this.axesOn)
		{
			renderAxes(this.obj_s, this.obj_r, this.obj_t, this.cam_proj);
		}

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
			if (this.vhover.length > 0)
			{
				const hbuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hbuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(this.vhover), gl.STATIC_DRAW);
				uColor.func(uColor.loc, [1,1,0,1]);
				uSize.func(uSize.loc, [7]);
				gl.drawElements(gl.POINTS, this.vhover.length, gl.UNSIGNED_SHORT, 0);
			}

			//--------------------------------------------------------------------------------------
			// Draw the vertices.
			//
			uColor.func(uColor.loc, [1,1,1,1]);
			uSize.func(uSize.loc, [3]);
			gl.drawArrays(gl.POINTS,0, this.vcount);

			//--------------------------------------------------------------------------------------
			// Draw the edges.
			//
			uColor.func(uColor.loc, [1,1,0,1]);
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
		+ '<a class="button small hovertext" id="edit-add" onclick="showPopup(\'add-popup\');" hover-text="Add gemoetry to model">Add</a><br/>'
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
		const rect = document.querySelector('#toolbar').getBoundingClientRect();
		this.downX = e.clientX - rect.width;
		this.downY = e.clientY;

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
		}
	}

	onMouseUp(e)
	{
		this.mouseMode = document.toolbar.mode.value;
	}

	onMouseMove(e)
	{
		const rect = document.querySelector('#toolbar').getBoundingClientRect();
		const mX = e.clientX - rect.width;
		const mY = e.clientY;
		const aX = this.downY - mY;
		const aY = this.downX - mX;
		const mag = Math.sqrt(aX * aX + aY * aY);

		switch (this.mouseMode)
		{
			case 'd_s':
				const centerX = gl.canvas.width / 2;
				const centerY = gl.canvas.height / 2;
				const dx1 = this.downX - centerX;
				const dy1 = this.downY - centerY;
				const dx2 = mX - centerX;
				const dy2 = mY - centerY;
				const mag1 = dx1 * dx1 + dy1 * dy1;
				const mag2 = dx2 * dx2 + dy2 * dy2;
				if (mag2 !== 0) this.obj_s = this.obj_s_save * Math.sqrt(mag2 / mag1);
			break;
			case 'd_r':
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
			break;
			case 'd_t':
				const d = Math.min(gl.canvas.width, gl.canvas.height);
				const dx = (mX - this.downX) / d;
				const dy = (mY - this.downY) / d;
				this.obj_t = [
					this.obj_t_save[0] - (this.obj_r[0] * dx - this.obj_r[1] * dy) * 2 / this.obj_s,
					this.obj_t_save[1] - (this.obj_r[3] * dx - this.obj_r[4] * dy) * 2 / this.obj_s,
					this.obj_t_save[2] - (this.obj_r[6] * dx - this.obj_r[7] * dy) * 2 / this.obj_s
				];
			break;
			case 'p':
			{
				this.vhover = [];
				this.verts.forEach((vert, index) => {
					vert.i = index;

					if ((mX > vert.pX - 3) && (mX < vert.pX + 3) && (mY > vert.pY - 3) && (mY < vert.pY + 3))
					{
						this.vhover.push(index);
					}
				});
			}
		}
	}

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

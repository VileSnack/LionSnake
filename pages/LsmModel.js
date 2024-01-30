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
					{ e:[this.edges[ecount + 0], this.edges[ecount + 5],this.edges[ecount + 1],this.edges[ecount + 4]], c:[.75,.75,.75,1] }
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

		const fdata = [];
		const tdata = [];

		this.ebuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(edata), gl.STATIC_DRAW);

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
					if ((edge.s === e[index - 1].s) || (edge.e === e[index - 1].e))
					{
						verts.push(edge.s);
					}
					else
					{
						verts.push(edge.e);
					}
				}
			});

			// calculate normal: nx, ny, nz

			const start = count;

			for (let i = 0; i < verts.length; i+=2)
			{
				fdata.push(vert[i].x, vert[i].y, vert[i].z, nx, ny, nz, ...face.c);
				count++;
			}

			for (let i = 1; i + 1 < verts.length/2; i++)
			{
				tdata.push[start + 0, start + i, start + i + 1); 
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
			let attrib = program.attributes['aPos'];
			let color = program.uniforms['uColor'];
			let size = program.uniforms['uSize'];
			let proj = program.matrices['uProj'];
			let trans = program.matrices['uTrans'];

			gl.useProgram(program.loc);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
			gl.vertexAttribPointer(attrib.loc, attrib.len, attrib.type, false, attrib.stride, attrib.offset);
			gl.enableVertexAttribArray(attrib.loc);
			gl.enable(gl.DEPTH_TEST)
			gl.uniformMatrix4fv(proj.loc, false, this.cam_proj);

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
			gl.uniformMatrix4fv(trans.loc, false, mat_t);

			//--------------------------------------------------------------------------------------
			// Draw the vertices.
			//
			color.func(color.loc, [1,1,1,1]);
			size.func(size.loc, [3]);
			gl.drawArrays(gl.POINTS,0, this.vcount);

			//--------------------------------------------------------------------------------------
			// Draw the edges.
			//
			color.func(color.loc, [1,1,0,1]);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebuffer);
			gl.drawElements(gl.LINES, this.ecount, gl.UNSIGNED_SHORT, 0);
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
		+ '<label class="customcheck"><input type="radio" name="mode" value="sel" checked /><span class="small hovertext" hover-text="Select">Sel</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="s" /><span class="hovertext" hover-text="Scale">S</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="r" /><span class="hovertext" hover-text="Rotate">R</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="t" /><span class="hovertext" hover-text="Translate">T</span></label><br/>'
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
	}

	recalcCamera()
	{
		this.cam_proj = this.view.recalc();
	}

	onContextMenu(event) {}
	onMouseClick(event) {}

	onMouseDown(e)
	{
		this.downX = e.clientX;
		this.downY = e.clientY;

		this.mouseMode = document.toolbar.mode.value;

		switch (this.mouseMode)
		{
			case 's':
				this.obj_s_save = this.obj_s;
			break;
			case 'r':
				this.obj_r_save = [...this.obj_r];
			break;
			case 't':
				this.obj_t_save = [...this.obj_t];
			break;
		}
	}

	// onMouseUp(e) { } // Commented out, base class behavior is correct

	onMouseMove(e)
	{
		const aX = this.downY - e.clientY;
		const aY = this.downX - e.clientX;
		const mag = Math.sqrt(aX * aX + aY * aY);

		switch (this.mouseMode)
		{
			case 's':
				const centerX = gl.canvas.width / 2;
				const centerY = gl.canvas.height / 2;
				const dx1 = this.downX - centerX;
				const dy1 = this.downY - centerY;
				const dx2 = e.clientX - centerX;
				const dy2 = e.clientY - centerY;
				const mag1 = dx1 * dx1 + dy1 * dy1;
				const mag2 = dx2 * dx2 + dy2 * dy2;
				if (mag2 !== 0) this.obj_s = this.obj_s_save * Math.sqrt(mag2 / mag1);
			break;
			case 'r':
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
			case 't':
				const d = Math.min(gl.canvas.width, gl.canvas.height);
				const dx = (e.clientX - this.downX) / d;
				const dy = (e.clientY - this.downY) / d;
				this.obj_t = [
					this.obj_t_save[0] - (this.obj_r[0] * dx - this.obj_r[1] * dy) * 2 / this.obj_s,
					this.obj_t_save[1] - (this.obj_r[3] * dx - this.obj_r[4] * dy) * 2 / this.obj_s,
					this.obj_t_save[2] - (this.obj_r[6] * dx - this.obj_r[7] * dy) * 2 / this.obj_s
				];
			break;
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

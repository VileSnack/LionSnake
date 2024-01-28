class LsmModel extends LsmProject
{
	static index = 1;

	constructor ()
	{
		super();
		this.verts = [];
		this.buffer = null;
		this.count = 0;
		this.view = new LsmView({pLocation: [0,0,-1], pLookAt: [0,0,0], sAngle: 19 });
		this.name = 'Model' + LsmModel.index++;
		this.axesOn = true;
		this.ang = 19;
		this.cam_proj = this.view.recalc();
		this.mouseMode = 0;
		this.obj_s = 1;
		this.obj_s_save = 1;
		this.obj_r = [1,0,0, 0,1,0, 0,0,1];
		this.obj_r_save = [1,0,0, 0,1,0, 0,0,1];
		this.obj_t = [0,0,0];
		this.obj_t_save = [0,0,0];

		this.downX = 0;
		this.downY = 0;
	}

	render()
	{
		if (this.axesOn)
		{
			renderAxes(this.obj_s, this.obj_r, this.obj_t, this.cam_proj);
		}

/*
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
*/
	}

	setToolbar()
	{
		document.querySelector('#toolbar').innerHTML = '<form name="toolbar">'
		+ '<a class="button small hovertext" id="button-new-project" onclick="showPopup(\'popup-new-project\');" hover-text="New Project">New</a><br/>'
		+ '<a class="button red hovertext" id="view-r" onclick="thisProject.xneg();" hover-text="View from right">X&ndash;</a><br/>'
		+ '<a class="button red hovertext" id="view-l" onclick="thisProject.xpos();" hover-text="View from left">X+</a><br/>'
		+ '<a class="button green hovertext" id="view-a" onclick="thisProject.yneg();" hover-text="View from above">Y&ndash;</a><br/>'
		+ '<a class="button green hovertext" id="view-u" onclick="thisProject.ypos();" hover-text="View from under">Y+</a><br/>'
		+ '<a class="button blue hovertext" id="view-f" onclick="thisProject.zneg();" hover-text="View from front">Z&ndash;</a><br/>'
		+ '<a class="button blue hovertext" id="view-b" onclick="thisProject.zpos();" hover-text="View from back">Z+</a><br/>'
		+ '<label class="customcheck"><input type="checkbox" name="pers" onchange="thisProject.recalcCamera();"/><span class="hovertext" hover-text="Toggle perspective">P</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="sel" checked /><span class="small hovertext" hover-text="Select">Sel</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="s" /><span class="hovertext" hover-text="Scale">S</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="r" /><span class="hovertext" hover-text="Rotate">R</span></label><br/>'
		+ '<label class="customcheck"><input type="radio" name="mode" value="t" /><span class="hovertext" hover-text="Translate">T</span></label><br/>'
		+ '<a class="button small hovertext" id="edit-add" onclick="showPopup(\'add-popup\');" hover-text="Add object to scene">Add</a><br/>'
		+ '</form>';
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
		if (this.view.hand > 0)
		{
			this.obj_r = [0,0,-1, 0,1,0, 1,0,0];
		}
		else
		{
			this.obj_r = [-1,0,0, 0,0,-1, 0,1,0];
		}
	}

	xpos()
	{
		if (this.view.hand > 0)
		{
			this.obj_r = [0,0,1, 0,1,0, -1,0,0];
		}
		else
		{
			this.obj_r = [1,0,0, 0,0,1, 0,1,0];
		}
	}

	yneg()
	{
		if (this.view.hand > 0)
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
		if (this.view.hand > 0)
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
		if (this.view.hand > 0)
		{
			this.obj_r = [-1,0,0, 0,1,0, 0,0,-1];
		}
		else
		{
			this.obj_r = [-1,0,0, 0,0,-1, 0,1,0];
		}
	}

	zpos()
	{
		if (this.view.hand > 0)
		{
			this.obj_r = [1,0,0, 0,1,0, 0,0,1];
		}
		else
		{
			this.obj_r = [1,0,0, 0,0,1, 0,1,0];
		}
	}
}

function createProject()
{
	document.querySelector('#popup-new-project').style.display = 'none';

	switch (document.create_project.type.value)
	{
		case 'model':
			thisProject = new LsmModel();
			projects.push(thisProject);
			activateProject(thisProject);
		break;
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

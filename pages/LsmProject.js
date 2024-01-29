class LsmProject {
	constructor (params)
	{
		if (('undefined' === typeof params)
			|| (null === params))
		{
			params = {};
		}

		if ('handedness' in params)
		{
			this.handedness = params.handedness;
		}
		else
		{
			this.handedness = 'l';
		}

		this.view = new LsmView({});
		this.name = '';
		this.mouseMode = '';
	}

	addObject() { }

	render()
	{
	}

	save()
	{
	}

	setToolbar()
	{
		document.querySelector('#toolbar').innerHTML = '<form name="toolbar">'
		+ '<a class="button small hovertext" id="button-new-project" onclick="showPopup(\'popup-new-project\');" hover-text="New Project">New</a><br/>'
		+ '</form>';
	}

	recalcCamera() { }

	onContextMenu(e) { return false; }
	onMouseClick(e) { return false; }
	onMouseDown(e) { return false; }
	onMouseUp(e) { this.mouseMode = ''; }
	onMouseMove(e) { return false; }

	xneg() { }
	xpos() { }
	yneg() { }
	ypos() { }
	zneg() { }
	zpos() { }
}

function activateProject(project)
{
	thisProject = project;
	document.title = `${thisProject.name} - The LionSnake Modeler`;

	thisProject.setToolbar();
}

function createProject()
{
	document.querySelector('#popup-new-project').style.display = 'none';

	switch (document.create_project.type.value)
	{
		case 'model':
			thisProject = new LsmModel({ handedness: document.create_project.handedness.value });
			projects.push(thisProject);
			activateProject(thisProject);
		break;
	}
}

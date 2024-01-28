class LsmProject {
	constructor (data)
	{
		if (('undefined' === typeof data)
			|| (null === data))
		{
			data = {};
		}

		this.view = new LsmView({});
		this.name = '';
		this.mouseMode = '';
	}

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

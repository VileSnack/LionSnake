const box_controls = [ 'scale_x', 'scale_y', 'scale_z', 'add_it' ];

const no_controls = [];

const all_controls = [ 'scale_x', 'scale_y', 'scale_z', 'add_it' ];

function updateAddPopup()
{
	let show = null;

	switch(document.add_object.type.value)
	{
		case 'box':
			show = box_controls;
		break;
		case '':
			show =  no_controls;
		break;
	}

	all_controls.forEach(item => {
		document.querySelector('#' + item).style.display = show.includes(item) ? '' : 'none';
	});
}

function AddObject()
{
	document.querySelector('#add-popup').style.display = 'none';

	
}

function xneg()
{
	m_rot = [0,0,-1,0, 0,1,0,0,  1,0,0,0, 0,0,0,1];
}

function xpos()
{
	m_rot = [0,0, 1,0, 0,1,0,0, -1,0,0,0, 0,0,0,1];
}

function yneg()
{
	m_rot = [ 1,0,0,0, 0,0,-1,0, 0,1,0,0, 0,0,0,1];
}

function ypos()
{
	m_rot = [ 1,0,0,0, 0,0,-1,0, 0, 1,0,0, 0,0,0,1];
}

function zneg()
{
	m_rot = [-1,0,0,0, 0,1,0,0, 0,0,-1,0, 0,0,0,1];
}

function zpos()
{
	m_rot = [ 1,0,0,0, 0,1,0,0, 0,0, 1,0, 0,0,0,1];
}

function modeTranslate()
{
	dragMode = 't';
	document.querySelector('#mode-t').classList.add('set');
	document.querySelector('#mode-s').classList.remove('set');
	document.querySelector('#mode-r').classList.remove('set');
}

function modeScale()
{
	dragMode = 's';
	document.querySelector('#mode-t').classList.remove('set');
	document.querySelector('#mode-s').classList.add('set');
	document.querySelector('#mode-r').classList.remove('set');
}

function modeRotate()
{
	dragMode = 'r';
	document.querySelector('#mode-t').classList.remove('set');
	document.querySelector('#mode-s').classList.remove('set');
	document.querySelector('#mode-r').classList.add('set');
}

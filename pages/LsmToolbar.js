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
	m_rot = [-1,0,0,0, 0,0, 1,0, 0,1,0,0, 0,0,0,1];
}

function zneg()
{
	m_rot = [-1,0,0,0, 0,1,0,0, 0,0,-1,0, 0,0,0,1];
}

function zpos()
{
	m_rot = [ 1,0,0,0, 0,1,0,0, 0,0, 1,0, 0,0,0,1];
}

function add()
{
	document.querySelector('#add-popup').style.display = '';
}
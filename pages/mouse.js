/*
let downX = 0;
let downY = 0;

function onMouseClick()
{
	return false;
}

function onContextMenu()
{
	return false;
}

function onMouseDown(e)
{
	downX = e.clientX;
	downY = e.clientY;

	dragMode = document.toolbar.mode.value;

	switch (dragMode)
	{
		case 's':
			zoom_save = zoom;
		break;
		case 'r':
			for (let i = 0; i < 16; i++) m_sav[i] = m_rot[i];
		break;
		case 't':
			p_sav = [...p_eye];
		break;
	}

	mouseMode = 1;
}

function onMouseUp(e)
{
	mouseMode = 0;
}

function onMouseMove(e)
{
	if (null === thisProject) return;

	switch (mouseMode)
	{
		case 1:
			const aX = downY - e.clientY;
			const aY = downX - e.clientX;
			const mag = Math.sqrt(aX * aX + aY * aY);

			switch (dragMode)
			{
				case 's':
					const dx1 = downX - centerX;
					const dy1 = downY - centerY;
					const dx2 = e.clientX - centerX;
					const dy2 = e.clientY - centerY;
					const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
					const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
					if (mag2 !== 0) zoom = zoom_save * mag2 / mag1;
				break;
				case 'r':
					if (0 === mag)
					{
						for (let i = 0; i < 16; i++) m_rot[i] = m_sav[i];
					}
					else
					{
						const u = aX / mag;
						const v = aY / mag;
						const c = Math.cos(mag * .01);
						const s = Math.sin(mag * .01);

						multiply(m_sav,
							[
								u * u + c * v * v, u * v - c * u * v, -s * v, 0,
								u * v - c * u * v, v * v + c * u * u, s * u, 0,
								s * v, -s * u,  c, 0,
								0, 0, 0, 1
							],
							m_rot
						);
					}
				break;
				case 't':
					const d = Math.min(gl.canvas.width, gl.canvas.height);
					const dx = (e.clientX - downX) / d;
					const dy = (e.clientY - downY) / d;
					p_eye[0] = p_sav[0] - (m_rot[0] * dx - m_rot[1] * dy) * 2 / zoom;
					p_eye[1] = p_sav[1] - (m_rot[4] * dx - m_rot[5] * dy) * 2 / zoom;
					p_eye[2] = p_sav[2] - (m_rot[8] * dx - m_rot[9] * dy) * 2 / zoom;
				break;
			}

		break;
	}
}
*/

const far = 1000;

class LsmView
{
	constructor(settings)
	{
		if (!settings)
		{
			settings = { };
		}

		if ('handedness' in settings)
		{
			this.handedness = settings.handedness.substring(0,1);
		}
		else
		{
			this.handedness = 'l';
		}

		if ('pLocation' in settings)
		{
			this.pLocation = [...settings.pLocation];
		}
		else
		{
			this.pLocation = (this.handedness === 'l') ? [0,0,-1] : [0,-1,0];
		}

		if ('vSky' in settings)
		{
			this.vSky = [...settings.vSky];
			this.vSky = vnormalize(this.vSky);
		}
		else
		{
			this.vSky = (this.handedness === 'l') ? [0,1,0] : [0,0,1];
		}

		if ('sZoom' in settings)
		{
			this.sZoom = settings.sZoom;
		}
		else
		{
			this.sZoom = 1;
		}

		if ('pLookAt' in settings)
		{
			this.pLookAt = settings.pLookAt;
		}
		else
		{
			this.pLookAt = [0,0,0];
		}

		this.vDirection = vsub(this.pLookAt, this.pLocation);
		this.vDirection = vnormalize(this.vDirection);

		if ('l' === this.handedness)
		{
			this.vRight = vcross(this.vSky, this.vDirection);
			this.vUp = vcross(this.vDirection, this.vRight);
		}
		else
		{
			this.vRight = vcross(this.vDirection, this.vSky);
			this.vUp = vcross(this.vRight, this.vDirection);
		}

		this.vRight = vnormalize(this.vRight);
		this.vUp = vnormalize(this.vUp);

		if ('sAngle' in settings)
		{
			this.sPers = Math.tan(settings.sAngle * Math.PI / 360);
		}
		else
		{
			this.sPers = 0;
		}
	}

	recalc()
	{
		let d = Math.min(gl.canvas.width, gl.canvas.height);

		const pers = document.toolbar.pers?.checked ? this.sPers : 0;

		const near = (0 === pers) ? -far : -Math.min(far, 1 / pers - .01);

		const c10 = (pers * far + pers * near + 2) / (far - near);
		const c14 = (-pers * far * near - far - near) / (far - near);

		return new Float32Array([
			d / gl.canvas.width,	0,						0,		0,
			0,						d / gl.canvas.height,	0,		0,
			0,						0,						c10,	pers,
			0,						0,						c14,	1
		]);
	}
}

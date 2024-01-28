const far = 1000;

class LsmView
{
	constructor(settings)
	{
		if (!settings)
		{
			settings = { };
		}

		if ('pLocation' in settings)
		{
			this.pLocation = [...settings.pLocation];
		}
		else
		{
			this.pLocation = [0,0,0];
		}

		if ('vSky' in settings)
		{
			this.vSky = [...settings.vSky];
			this.vSky = vnormalize(this.vSky);
		}
		else
		{
			this.vSky = [0,1,0];
		}

		if ('sZoom' in settings)
		{
			this.sZoom = settings.sZoom;
		}
		else
		{
			this.sZoom = 1;
		}

		if ('vRight' in settings)
		{
			this.vRight = [...settings.vRight];
			this.vRight = vnormalize(this.vRight);
		}
		else
		{
			this.vRight = [1,0,0];
		}

		if ('vUp' in settings)
		{
			this.vUp = [...settings.vUp];
			this.vUp = vnormalize(this.vUp);
		}
		else
		{
			this.vUp = [0,1,0];
		}

		if ('vDirection' in settings)
		{
			this.vDirection = [...settings.vDirection];
			this.sZoom = mag(this.vDirection);
			this.vDirection = vnormalize(this.vDirection);
		}
		else
		{
			this.vDirection = [0,0,1];
		}

		this.hand = Math.sign(dot(this.vRight, vcross(this.vUp, this.vDirection)));

		if ('pLookAt' in settings)
		{
			this.vDirection = vsub(settings.pLookAt, this.pLocation);
			this.vDirection = vnormalize(this.vDirection);

			if (this.hand > 0)
			{
				this.vRight = vcross(this.vSky, this.vDirection);
			}
			else
			{
				this.vRight = vcross(this.vDirection, this.vSky);
			}

			this.vRight = vnormalize(this.vRight);

			if (this.hand > 0)
			{
				this.vUp = vcross(this.vDirection, this.vRight);
			}
			else
			{
				this.vUp = vcross(this.vRight, this.vDirection);
			}

			this.vUp = vnormalize(this.vUp);
		}

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

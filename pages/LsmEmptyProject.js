class LsmEmptyProject extends LsmProject
{
	constructor (params)
	{
		if ('undefined' == typeof params) params = {};
		if (params.test) console.log("Entering LsmEmptyProject.ctor()");
		super(params);
		if (params.test) console.log("Exiting LsmEmptyProject.ctor()");
	}
}

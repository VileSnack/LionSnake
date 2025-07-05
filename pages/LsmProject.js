var projects = [];

class LsmProject
{
	constructor (params)
	{
		if (params.test) console.log("Entering LsmProject.ctor()");
		projects.push(this);
		if (params.test) console.log("Exiting LsmProject.ctor()");
	}
}

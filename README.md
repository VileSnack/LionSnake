This is a conversion of the LionSnake modeler from a Windows desktop application (C++ & OpenGL 1) to a WebGL application.

# History:

Back before some of you were born, I came across the Persistence of Vision Ray Tracer (which you can get for free at www.povray.org), a freely-available 3d graphics rendering application. It has many strengths, but for most users it has one weakness: It does not have a GUI interface for creating models. This makes many things of interest (such as a human being) very difficult to create in POV-Ray.

Having no small skill with software, I decided to create my own modeler, originally using the Windows GDI before learning OpenGL, to generate models for POV-Ray. I named it LionSnake (having been born under the sign of Leo in the Year of the Snake). It was *usable*, but not that great, and I stopped development in the middle oughts.

In 2023 I was laid off, and to make sure that I did not waste my time playing games I started working on the projects that are all in other repos here. I got a certain ways, but after getting a new position I let these projects wither in the vine.

I have now resumed development, and I've decided to simply start over, having forgotten most of what I had done.

Progress:

2025-07-04:
- Started over.
- Hollowed out `LsmProject.js`
- Added LsmProject.ctor()
	- Raises alert for entering and entering
- Added LsmEmptyProject.js
- Added LsmEmptyProject.ctor()
	- Raises alert for entering
	- Calls LsmProject.ctor()
	- Raises alert for exiting
- Added /Test pages/test0001.html
	- Creates a LsmEmptyProject object
	- User should see the four alerts described above, with the base class alerts nested between the derived class alerts.

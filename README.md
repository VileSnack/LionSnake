This is a conversion of the LionSnake modeler from a Windows desktop application (C++ & OpenGL 1) to a WebGL application.

# History:

Back before some of you were born, I came across the Persistence of Vision Ray Tracer (which you can get for free at www.povray.org), a freely-available 3d graphics rendering application. It has many strengths, but for most users it has one weakness: It does not have a GUI interface for creating models. This makes many things of interest (such as a human being) very difficult to create in POV-Ray.

Having no small skill with software, I decided to create my own modeler, originally using the Windows GDI before learning OpenGL, to generate models for POV-Ray. I named it LionSnake (having been born under the sign of Leo in the Year of the Snake). It was *usable*, but not that great, and I stopped development in the middle oughts.

~~In the mean time WebGL has made fairly performant 3D graphics possible within the web browser environment, and between that, and the lack of native OpenGL support in Windows, and the completely execrable state of Direct3D tutorials on the web, I decided to port LionSnake into WebGL.~~ Except that WebGPU has been released and promises to be even better, so I'll convert the existing code to WebGPU.

# Current state

The file `server.js` is a Node.js file hosting a LionSnake server. All it does now is serve the pages. I intend to add the ability to upload and download files, and to save user models and scenes on the server.

For local development purposes, you can simply load the file `pages/home.html` into your browser and you should have all of the functionality that doesn't require file operations.

Here is the roadmap of the features I want to implement. As you can see, I haven't gotten very far with this project:

* Project types
	* Projects can be created to use left-hand (Y is up, Z is forward) or right-hand (Z is up, Y is forward) orientation.
	* Models can be created.
		* The user can add a cube.
		* The user can drag the individual vertices of the added cube.
		* TODO: Support editing the added geometry.
		* TODO: Support adding other object shapes (tori, cylinders, etc.)
		* TODO: Support rigging for posable models.
		* TODO: Support for texturing the geometry.
		* TODO: Support for subdivision surfaces.
	* TODO: Add scene project support.
* TODO: File operations
	* Save - Projects will be saved to the library at regular intervals.
	* Load - Projects can be loaded from the library.
	* Export - The user can download the model or scene as a package for supported renderers.
	* Import - The user can upload supported file types and add them to the library.
* User Experience:
	* The axes are displayed upon model project creation.
	* TODO: Add control to toggle display of the axes.
	* TODO: Label the axes.
	* The model view can be zoomed, rotated, and translated.
	* The model view can be switched between orthographic and perspective projections.

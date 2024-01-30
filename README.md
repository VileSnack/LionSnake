This is a conversion of the LionSnake modeler from a Windows desktop application (C++ & OpenGL 1) to a WebGL application.

# History:

Back before some of you were born, I came across the Persistence of Vision Ray Tracer (which you can get for free at www.povray.org), a freely-available 3d graphics rendering application. It has many strengths, but for most users it has one weakness: It does not have a GUI interface for creating models. This makes many things of interest (such as a human being) very difficult to create in POV-Ray.

Having no small skill with software, I decided to create my own modeler, originally using the Windows GDI before learning OpenGL, to generate models for POV-Ray. I named it LionSnake (having been born under the sign of Leo in the Year of the Snake). It was *usable*, but not that great, and I stopped development in the middle oughts.

In the mean time WebGL has made fairly performant 3D graphics possible within the web browser environment, and between that, and the lack of native OpenGL support in Windows, and the completely execrable state of Direct3D tutorials on the web, I decided to port LionSnake into WebGL.

# Current state

The file `server.js` is a Node.js file for serving LionSnake on a server. All it does now is serve the pages. I intend to add the ability to upload and download model files from this server, which will keep them in a specific folder to avoid shenanigans.

For local development purposes, you can simply load the file `pages/home.html` into your browser and you should have all of the functionality that doesn't require file operations.

Here is the roadmap of the features I want to implement, and their status. As you can see, I haven't gotten very far with this project:

|Feature|Status|Changes planned|
|---|---|
|Project types|Users can create model projects.|Scene projects|
|Axes|Always on|Ability to turn off|
|View|User can zoom, rotate, and translate the View, and switch between perspective and orthographic view|No changes planned|
|Geometry|The user can add the edges and vertices for a cube.|Add faces to added Geometry|
|||Add other shapes|
|File operations|None|Add ability to load and save model and scene files to local library, export to as-yet-unidentified formats.|

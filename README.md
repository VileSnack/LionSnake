This is a conversion of the LionSnake modeler from a Windows desktop application (C++ & OpenGL 1) to a WebGL application.

History:

Back before some of you were born, I came across the Persistence of Vision Ray Tracer (which you can get for free at www.povray.org), a freely-available 3d graphics rendering application. It has many strengths, but for most users it has one weakness: It does not have a GUI interface for creating models. This makes many things of interest (such as a human being) very difficult to create in POV-Ray.

Having no small skill with software, I decided to create my own modeler, originally using the Windows GDI before learning OpenGL, to generate models for POV-Ray. I named it LionSnake (having been born under the sign of Leo in the Year of the Snake). It was /usable/, but not that great, and I stopped development in the middle oughts.

In the mean time WebGL has made fairly performant 3D graphics possible within the web browser environment, and between that, and the lack of native OpenGL support in Windows, and the completely execrable state of Direct3D tutorials on the web, I decided to port LionSnake into WebGL.


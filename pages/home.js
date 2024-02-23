async function onLoad()
{
	canvas = document.querySelector('#glcanvas');

	await initWebGPU();

	for(const key in shaders)
	{
		const code = shaders[key];
		modules[key] = device.createShaderModule({ code });
		console.log(`Shader "${key}" built.`);
	}

	for (const key in vertex_sets)
	{
		const vset = vertex_sets[key];

		vset.data = new Float32Array(vset.data);

		vset.buffer = device.createBuffer({
			size: vset.data.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		device.queue.writeBuffer(vset.buffer, 0, vset.data);

		delete vset.data;
		console.log(`Vertex set "${key}" built.`);
	}

	for (const key in index_sets)
	{
		const iset = index_sets[key];

		iset.count = iset.data.length;

		iset.data = new Uint16Array(iset.data);

		iset.buffer = device.createBuffer({
			size: iset.data.byteLength,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
		});

		device.queue.writeBuffer(iset.buffer, 0, iset.data);

		delete iset.data;
		console.log(`Index set "${key}" built.`);
	}

	//----------------------------------------------------------------------------------------------
	// Set up the camera-to-frame buffer.
	//
	c2fBuffer = device.createBuffer({
		size: 64,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	device.queue.writeBuffer(c2fBuffer, 0, new Float32Array(identity));

	//----------------------------------------------------------------------------------------------
	// Kick off the animation loop.
	//
	window.requestAnimationFrame(animationLoop);
}

async function initWebGPU()
{
	if (!navigator.gpu) {
		throw Error("WebGPU not supported.");
	}

	adapter = await navigator.gpu?.requestAdapter();

	if (!adapter)
	{
		throw Error("Couldn't request WebGPU adapter.");
	}

	device = await adapter?.requestDevice();

	context = canvas.getContext('webgpu');

	if (!context)
	{
		throw Error('Could not get WebGPU context for canvas.');
	}

	presentationFormat = navigator.gpu.getPreferredCanvasFormat();

	context.configure({
		device: device,
		format: presentationFormat,
		alphaMode: "premultiplied"
	});
}

function animationLoop(timeStamp)
{
	if (null === startTime) startTime = timeStamp;

	const time = timeStamp - startTime;

	const rect = canvas.getBoundingClientRect();

	if (canvas.width !== rect.width || canvas.height != rect.height)
	{
		canvas.width = rect.width;
		canvas.height = rect.height;

		depthTexture = device.createTexture({
			size: [canvas.width, canvas.height],
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
	}

	//----------------------------------------------------------------------------------------------
	// Create a render pass.
	//
	const commandEncoder = device.createCommandEncoder();

	renderPassDescriptor = {
		colorAttachments: [
			{
				clearValue: backgroundColor,
				loadOp: "clear",
				storeOp: "store",
				view: context.getCurrentTexture().createView(),
			},
		],
		depthStencilAttachment: {
			view: depthTexture.createView(),
			depthClearValue: 1.0,
			depthLoadOp: "clear",
			depthStoreOp: "store",
		}
	};

	const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

	thisProject?.render(passEncoder, time);

	passEncoder.end();

	device.queue.submit([commandEncoder.finish()]);

	window.requestAnimationFrame(animationLoop);
}

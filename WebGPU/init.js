let adapter = null;
let device = null;
let canvas  = null;
let context = null;
let presentationFormat = null;

async function OnLoad()
{
	await initWebGPU();
	initOtherStuff();
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

	canvas = document.querySelector('#webgpu');
	canvas.width = canvas.getBoundingClientRect().width;
	canvas.height = canvas.getBoundingClientRect().height;
	context = canvas.getContext('webgpu');

	if (!context)
	{
		throw Error('Could not get WebGPU context for canvas.');
	}

	presentationFormat = navigator.gpu.getPreferredCanvasFormat();

	context.configure({
		device,
		format: presentationFormat,
	});
}

function initOtherStuff()
{
	for(const key in shaders)
	{
		const shader = shaders[key];

		shader.module = device.createShaderModule({code: shader.code });
		console.log(`Shader module "${key}" built.`);
	}

	for (const key in vertex_sets)
	{
		const vset = vertex_sets[key];

		vset.data = new Float32Array(vset.data);

		vset.buffer = device.createBuffer({
			size: vset.data.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
		});

		device.queue.writeBuffer(vset.buffer, 0, vset.data, 0, vset.data.length);

		delete vset.data;
		console.log(`Vertex set "${key}" built.`);
	}

	context.configure({
		device: device,
		format: navigator.gpu.getPreferredCanvasFormat(),
		alphaMode: "premultiplied",
	});

	//----------------------------------------------------------------------------------------------
	// Create the render pipeline for this render pass.
	//
	const pipelineDescriptor = {
		vertex: {
			module: shaders['basic'].module,
			entryPoint: shaders['basic'].vertexEntryPoint,
			buffers: vertex_sets['rgb_triangle'].vertexBuffers,
		},
		fragment: {
			module: shaders['basic'].module,
			entryPoint: shaders['basic'].fragmentEntryPoint,
			targets: [
				{
					format: navigator.gpu.getPreferredCanvasFormat(),
				},
			],
		},
		primitive: {
			topology: "triangle-list",
		},
		layout: "auto"
	};

	const renderPipeline = device.createRenderPipeline(pipelineDescriptor);

	//----------------------------------------------------------------------------------------------
	// Create a render pass.
	//
	const commandEncoder = device.createCommandEncoder();

	const clearColor = { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };

	const renderPassDescriptor = {
		colorAttachments: [
			{
				clearValue: clearColor,
				loadOp: "clear",
				storeOp: "store",
				view: context.getCurrentTexture().createView(),
			},
		],
	};

	const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

	passEncoder.setPipeline(renderPipeline);
	passEncoder.setVertexBuffer(0, vertex_sets['rgb_triangle'].buffer);
	passEncoder.draw(3);

	passEncoder.end();

	const renderPass = commandEncoder.finish();

	//----------------------------------------------------------------------------------------------
	// Send the render pass to the render queue.
	//
	device.queue.submit([renderPass]);
}

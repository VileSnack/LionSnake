let adapter = null;
let device = null;
let canvas  = null;
let context = null;
let presentationFormat = null;

const uniRecord = [1,1,1,1,0,0,0,0];
const clearColor = { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };

let uniBuffer = null;
let bindGroup = null;
let renderPipeline = null;

async function OnLoad()
{
	await initWebGPU();
	initOtherStuff();
	window.requestAnimationFrame(render);
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

	renderPipeline = device.createRenderPipeline(pipelineDescriptor);

	uniBuffer = device.createBuffer({
		size: uniRecord.length * 4,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	bindGroup = device.createBindGroup({
		layout: renderPipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: { buffer: uniBuffer }},
		],
	});
}

function render(time)
{
	uniRecord[0] = Math.random()*.1 + .95;
	uniRecord[1] = Math.random()*.1 + .95;
	uniRecord[4] = time / 1000;

	device.queue.writeBuffer(uniBuffer, 0, new Float32Array(uniRecord));

	//----------------------------------------------------------------------------------------------
	// Create a render pass.
	//
	const commandEncoder = device.createCommandEncoder();

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
	passEncoder.setBindGroup(0, bindGroup);
	passEncoder.draw(3);

	passEncoder.end();

	const renderPass = commandEncoder.finish();

	//----------------------------------------------------------------------------------------------
	// Send the render pass to the render queue.
	//
	device.queue.submit([renderPass]);

	window.requestAnimationFrame(render);
}

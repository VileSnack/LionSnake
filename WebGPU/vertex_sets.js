const vertex_sets = {
	'rgb_triangle': {
		data: [
			0.0, 0.6, 0, 1,
			1, 0, 0, 1,
			-0.5, -0.6, 0, 1,
			0, 1, 0, 1,
			0.5, -0.6, 0, 1,
			0, 0, 1, 1
		],
		vertexBuffers: [
			{
				attributes: [
					{
						shaderLocation: 0,
						offset: 0,
						format: "float32x4",
					},
					{
						shaderLocation: 1,
						offset: 16,
						format: "float32x4",
					},
				],
				arrayStride: 32,
				stepMode: "vertex"
			}
		]
	}
};
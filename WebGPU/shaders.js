const shaders = {
	'basic':
	{
		code: `
			struct UniRecord {
				scale: vec4f,
				angle: f32
			};

			@group(0) @binding(0) var<uniform> uniRecord: UniRecord;

			struct VertexOut {
				@builtin(position) position : vec4f,
				@location(0) color : vec4f
			}

			@vertex
			fn vertex_main(@location(0) position: vec4f,
				@location(1) color: vec4f) -> VertexOut
			{
				var output : VertexOut;
				var c: f32 = cos(uniRecord.angle);
				var s: f32 = sin(uniRecord.angle);
				var rot: mat4x4f = mat4x4f(c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1);
				output.position = rot * position;
				output.color = color;
				return output;
			}

			@fragment
			fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
			{
				return fragData.color;
			}`,
		vertexEntryPoint: 'vertex_main',
		fragmentEntryPoint: 'fragment_main'
	}
};

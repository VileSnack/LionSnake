const modules = {};
const shaders = {
	/* This is the shader used for the axes. */
	'mono':
		'struct VertexIn {'
		+ ' @location(0) position : vec4f,'
		+ ' @location(1) transX : vec4f,'
		+ ' @location(2) transY : vec4f,'
		+ ' @location(3) transZ : vec4f,'
		+ ' @location(4) transL : vec4f,'
		+ ' @location(5) color : vec4f'
		+ ' };'
		+ ' struct VertexOut { @builtin(position) position : vec4f, @location(0) color : vec4f };'

		+ ' @group(0) @binding(0) var<uniform> uniProj: mat4x4f;'

		+ ' @vertex fn vertex_main(input: VertexIn) -> VertexOut'
		+ ' {'
		+ ' 	var output : VertexOut;'
		+ ' 	output.position = uniProj * mat4x4f(input.transX, input.transY, input.transZ, input.transL) * input.position;'
		+ ' 	output.color = input.color;'
		+ ' 	return output;'
		+ ' }'

		+ ' @fragment fn fragment_main(fragData: VertexOut) -> @location(0) vec4f'
		+ ' {'
		+ ' 	return fragData.color;'
		+ ' }'
	,
	/* This is the shader used for drawing the vertices. */
	'offset':
		'struct VertexIn {'
		+ ' @location(0) position : vec4f,'
		+ ' @location(1) offset : vec2f,'
		+ ' @location(2) color : vec4f'
		+ ' };'
		+ ' struct VertexOut { @builtin(position) position : vec4f, @location(0) color : vec4f };'

		+ ' @group(0) @binding(0) var<uniform> uniProj: mat4x4f;'
		+ ' @group(0) @binding(1) var<uniform> scaleX: f32;'
		+ ' @group(0) @binding(2) var<uniform> scaleY: f32;'

		+ ' @vertex fn vertex_main(input: VertexIn) -> VertexOut'
		+ ' {'
		+ ' 	var output : VertexOut;'
		+ ' 	output.position = uniProj * input.position;'
		+ ' 	output.position = output.position + vec4f(input.offset.x * output.position.w * scaleX, input.offset.y * output.position.w * scaleY, 0,0);'
		+ ' 	output.color = input.color;'
		+ ' 	return output;'
		+ ' }'

		+ ' @fragment fn fragment_main(fragData: VertexOut) -> @location(0) vec4f'
		+ ' {'
		+ ' 	return fragData.color;'
		+ ' }'
/*
	,
	'shaded':
		`@group(0) @binding(0) var<uniform> uniTrans: mat4x4f;
		@group(0) @binding(1) var<uniform> uniProj: mat4x4f;
		@group(0) @binding(2) var<uniform> uniLight: vec3f;

		struct VertexOut {
			@builtin(position) position : vec4f,
			@location(0) color : vec4f
		}

		@vertex
		fn vertex_main(
			@location(0) position: vec4f,
			@location(1) normal: vec3f,
			@location(2) color: vec4f
		) -> VertexOut
		{
			var output : VertexOut;
			output.position = uniProj * uniTrans * position;
			output.color = color * (max(0, dot(uniLight, normal)) *0.5 + 0.5);
			return output;
		}

		@fragment
		fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
		{
			return fragData.color;
		}`
*/
};

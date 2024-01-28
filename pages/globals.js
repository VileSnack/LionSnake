//--------------------------------------------------------------------------------------------------
// Yeah, globals are bad, so sue me...
//
let canvas = null;
let gl = null;
const programList = [];
const shaders = {};
const projects = [];
let thisProject = null;

// Some constants.
const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

let background = [.5, .5, .5, 1.0];	//	The background color

const log10 = Math.log(10);

let startTime = null;

const things = {};


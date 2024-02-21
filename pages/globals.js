//--------------------------------------------------------------------------------------------------
// Yeah, globals are bad, so sue me...
//
let adapter = null;
const backgroundColor = { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };
let c2fBuffer = null;
let canvas = null;
let context = null;
let device = null;
let gl = null;
const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
const log10 = Math.log(10);
let presentationFormat = null;
const programList = [];
const projects = [];
let startTime = null;
const things = {};
let thisProject = null;

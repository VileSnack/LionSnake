let canvas = null;
let gl = null;

const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

let background = [.5, .5, .5, 1.0];	//	The background color

const p_l = [-1,2,-7.3];	// The location of the camera, in world coordinates
const v_s = [0,1,0];	// Points to the sky, in world coordinates

let m_rot = [...identity];	// The current rotation of the model view
const m_sav = [...identity];	// Saves off the starting rotation of the model
let p_eye = [0,0,0];			// The current center of the model view
let p_sav = [0,0,0];			// Saves off p_eye for drag operations

const log10 = Math.log(10);

let far = 1000;
let near = -1000;
let zoom = 1;
let zoom_save = 1;
let mouseMode = 0;
let centerX = 0;
let centerY = 0;

let dragMode = 't';

let c2f = [...identity];	// this is the projection matrix for the camera

const renderCalls = [];

let startTime = null;

const octo = {}; // an object we're playing with

const programList = [];

const shaders = {};

const things = {};

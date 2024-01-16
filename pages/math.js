function dot(vecA, vecB)
{
	if (typeof vecB === 'undefined' || vecB === null) vecB = vecA;

	return vecA[0]*vecB[0] + vecA[1]*vecB[1] + vecA[2]*vecB[2];
}

function multiply(src1, src2, dst)
{
	if (src1 === dst || src2 === dst)
	{
		let temp = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		multiply(src1, src2, temp);
		for (let i = 0; i < 16; i++) dst[i] = temp[i];
		return;
	}

	dst[ 0] = src1[ 0] * src2[0] + src1[ 1] * src2[4] + src1[ 2] * src2[ 8] + src1[ 3] * src2[12];
	dst[ 1] = src1[ 0] * src2[1] + src1[ 1] * src2[5] + src1[ 2] * src2[ 9] + src1[ 3] * src2[13];
	dst[ 2] = src1[ 0] * src2[2] + src1[ 1] * src2[6] + src1[ 2] * src2[10] + src1[ 3] * src2[14];
	dst[ 3] = src1[ 0] * src2[3] + src1[ 1] * src2[7] + src1[ 2] * src2[11] + src1[ 3] * src2[15];
	dst[ 4] = src1[ 4] * src2[0] + src1[ 5] * src2[4] + src1[ 6] * src2[ 8] + src1[ 7] * src2[12];
	dst[ 5] = src1[ 4] * src2[1] + src1[ 5] * src2[5] + src1[ 6] * src2[ 9] + src1[ 7] * src2[13];
	dst[ 6] = src1[ 4] * src2[2] + src1[ 5] * src2[6] + src1[ 6] * src2[10] + src1[ 7] * src2[14];
	dst[ 7] = src1[ 4] * src2[3] + src1[ 5] * src2[7] + src1[ 6] * src2[11] + src1[ 7] * src2[15];
	dst[ 8] = src1[ 8] * src2[0] + src1[ 9] * src2[4] + src1[10] * src2[ 8] + src1[11] * src2[12];
	dst[ 9] = src1[ 8] * src2[1] + src1[ 9] * src2[5] + src1[10] * src2[ 9] + src1[11] * src2[13];
	dst[10] = src1[ 8] * src2[2] + src1[ 9] * src2[6] + src1[10] * src2[10] + src1[11] * src2[14];
	dst[11] = src1[ 8] * src2[3] + src1[ 9] * src2[7] + src1[10] * src2[11] + src1[11] * src2[15];
	dst[12] = src1[12] * src2[0] + src1[13] * src2[4] + src1[14] * src2[ 8] + src1[15] * src2[12];
	dst[13] = src1[12] * src2[1] + src1[13] * src2[5] + src1[14] * src2[ 9] + src1[15] * src2[13];
	dst[14] = src1[12] * src2[2] + src1[13] * src2[6] + src1[14] * src2[10] + src1[15] * src2[14];
	dst[15] = src1[12] * src2[3] + src1[13] * src2[7] + src1[14] * src2[11] + src1[15] * src2[15];
}

function rotateX(dstMatrix, poseArray, poseIndex)
{
	let ang = poseArray[poseIndex] % 360.0;

	if (0.0 === ang) return;

	ang *= Math.PI / 180.0;

	const u = Math.cos(ang);
	const v = Math.sin(ang);

	multiply(dstMatrix, [1,0,0,0, 0,u,v,0, 0,-v,u,0, 0,0,0,1], dstMatrix);
}

function rotateY(dstMatrix, poseArray, poseIndex)
{
	let ang = poseArray[poseIndex] % 360.0;

	if (0.0 === ang) return;

	ang *= Math.PI / 180.0;

	const u = Math.cos(ang);
	const v = Math.sin(ang);

	multiply(dstMatrix, [u,0,-v,0, 0,1,0,0, v,0,u,0, 0,0,0,1], dstMatrix);
}

function rotateZ(dstMatrix, poseArray, poseIndex)
{
	let ang = poseArray[poseIndex] % 360.0;

	if (0.0 === ang) return;

	ang *= Math.PI / 180.0;

	const u = Math.cos(ang);
	const v = Math.sin(ang);

	multiply(dstMatrix, [u,v,0,0, -v,u,0,0, 0,0,1,0, 0,0,0,1], dstMatrix);
}

function scaleXYZ(dstMatrix, poseArray, poseIndex)
{
	multiply(dstMatrix, [ poseArray[poseIndex],0.0,0.0,0.0, 0.0,poseArray[poseIndex + 1],0.0,0.0, 0.0,0.0,poseArray[poseIndex + 2],0.0, 0.0,0.0,0.0,1.0], dstMatrix);
}

function scaleU(dstMatrix, poseArray, poseIndex)
{
	if (1.0 !== poseArray[poseIndex])
		multiply(dstMatrix, [ poseArray[poseIndex],0.0,0.0,0.0, 0.0,poseArray[poseIndex],0.0,0.0, 0.0,0.0,poseArray[poseIndex],0.0, 0.0,0.0,0.0,1.0], dstMatrix);
}

function scaleX(dstMatrix, poseArray, poseIndex)
{
	if (1.0 !== poseArray[poseIndex])
		multiply(dstMatrix, [ poseArray[poseIndex],0.0,0.0,0.0, 0.0,1.0,0.0,0.0, 0.0,0.0,1.0,0.0, 0.0,0.0,0.0,1.0], dstMatrix);
}

function scaleY(dstMatrix, poseArray, poseIndex)
{
	if (1.0 !== poseArray[poseIndex])
		multiply(dstMatrix, [ 1.0,0.0,0.0,0.0, 0.0,poseArray[poseIndex],0.0,0.0, 0.0,0.0,1.0,0.0, 0.0,0.0,0.0,1.0], dstMatrix);
}

function scaleZ(dstMatrix, poseArray, poseIndex)
{
	if (1.0 !== poseArray[poseIndex])
		multiply(dstMatrix, [ 1.0,0.0,0.0,0.0, 0.0,1.0,0.0,0.0, 0.0,0.0,poseArray[poseIndex],0.0, 0.0,0.0,0.0,1.0], dstMatrix);
}

function translateXYZ(dstMatrix, poseArray, poseIndex)
{
	dstMatrix[ 3] += poseArray[poseIndex];
	dstMatrix[ 7] += poseArray[poseIndex + 1];
	dstMatrix[11] += poseArray[poseIndex + 2];
}

function translateX(dstMatrix, poseArray, poseIndex)
{
	if (0.0 !== poseArray[poseIndex])
		dstMatrix[12] += poseArray[poseIndex];
}

function translateY(dstMatrix, poseArray, poseIndex)
{
	if (0.0 !== poseArray[poseIndex])
		dstMatrix[13] += poseArray[poseIndex];
}

function translateZ(dstMatrix, poseArray, poseIndex)
{
	if (0.0 !== poseArray[poseIndex])
		dstMatrix[14] += poseArray[poseIndex];
}

function matTrans(dstMatrix, poseArray, poseIndex)
{
	for (var index = 0; index < 16; index++)
	{
		dstMatrix[index] = poseArray[poseIndex + index];
	}
}

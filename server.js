const http = require('http');
const fs = require('fs').promises;

const host = '0.0.0.0';
const port = 8000;

const requestListener = function(request, response)
{
	switch (request.method)
	{
		case 'GET':
			getRequestHandler(request, response);
		break;
		case 'POST':
			postRequestHandler(request, response);
		break;
	}
}

//--------------------------------------------------------------------------------------------------
// Serves a static web pages.
//
const getRequestHandler = function (request, response)
{
	if ('/' === request.url) request.url = '/home.html';

	const fileExtension = request.url.substr(request.url.lastIndexOf('.') + 1);
	let mimeType = '';

	switch (fileExtension)
	{
		case 'css':
			mimeType = 'text/css; charset=utf-8';
		break;
		case 'html':
			mimeType = 'text/html; charset=utf-8';
		break;
		case 'js':
			mimeType = 'text/javascript; charset=utf-8';
		break;
	}

	fs.readFile(__dirname + '/pages' + request.url)
		.then(contents => {
			response.setHeader('Content-Type', `${mimeType}`);
			response.writeHead(200);
			response.end(contents);
		})
		.catch(err => {
			response.setHeader('Content-Type', 'text/html');
			response.writeHead(200);
			response.end(`<html><head><title>Oops!</title></head><body><h1>Oops! (${request.url})</h1><p>It is our painful duty to report that something bad happened at our end. For this you have our most sincere apologies.</p></body></html>`);
		})
	;
};

const postRequestHandler = function (request, response)
{
	const data = [];

	request.on('data', (chunk) => { data.push(chunk); });
	request.on('end', () => {
		const bodyText = Buffer.concat(data);
		const body = JSON.parse(bodyText);

		processClientMessage(body, response);

	});
};

const processClientMessage = function (body, response)
{
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.end(JSON.stringify(body));
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
	console.log(`Server is running on http://${host}:${port}`);
});

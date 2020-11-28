const HTTPS_PORT = 443; //default port for https is 443
const HTTP_PORT = 80; //default port for http is 80
const secure = true;

'use strict'

const debug = true;


const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require("path");
const WebSocket = require('ws');
// based on examples at  https://www.npmjs.com/package/ws
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
    key: fs.readFileSync('keys/privkey1.pem'),
    cert: fs.readFileSync('keys/fullchain1.pem'),

    //key: fs.readFileSync('/etc/letsencrypt/live/www.logeo.co/privkey.pem'),
    //cert: fs.readFileSync('/etc/letsencrypt/live/www.logeo.co/fullchain.pem'),
};


// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function (request, response) {
    // Render the single client html file for any request the HTTP server receives
    console.log((new Date()).toLocaleDateString('en-US') + ' ' + (new Date()).toLocaleTimeString('en-US') + '   request received: ' + request.url);


    if (request.url === '/logeo.js') {
        response.writeHead(200, {'Content-Type': 'application/javascript'});
        response.end(fs.readFileSync('dist/logeo.js'));
    } else if (request.url.endsWith('.js')) {
        response.writeHead(200, { 'Content-Type': 'application/javascript' });
        response.end(fs.readFileSync('client' + request.url));
    } else if (request.url === '/style.css') {
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.end(fs.readFileSync('client/style.css'));
    } else if (request.url.endsWith('.css')) {
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.end(fs.readFileSync('client' + request.url));
    } else if (request.url === '/decal.png') {
        response.writeHead(200, { 'Content-Type': 'image/jpeg' });
        response.end(fs.readFileSync('img/logeo_logo.jpg'));
    } else if (request.url.endsWith('.gif')) {
        response.writeHead(200, { 'Content-Type': 'image/gif' });
        response.end(fs.readFileSync('img' + request.url));
    } else if (request.url.endsWith('.png')) {
        response.writeHead(200, { 'Content-Type': 'image/png' });
        response.end(fs.readFileSync('img' + request.url));
    } else if (request.url === '/svg_test.svg') {
        response.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        response.end(fs.readFileSync('img/svg_test.svg'));
    } else if (request.url === '/about.html') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(fs.readFileSync('client/about.html'));
    } else if (request.url === '/tutorial.html') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(fs.readFileSync('client/tutorial.html'));
    } else if (request.url === '/faq.html') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(fs.readFileSync('client/faq.html'));
    } else if (request.url === '/contact.html') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(fs.readFileSync('client/contact.html'));
    } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(fs.readFileSync('client/index.html'));
    }
};


const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT);

//const httpServer = https.createServer(serverConfig, handleRequest);
//httpServer.listen(HTTP_PORT);


// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });
//const wss = new WebSocketServer({ server: httpServer });



wss.on('connection', function (ws, request, client) {

    ws.on('message', function (message, client) {

        if (message === '') {
            //console.log('received keep alive');
            return;
        }

        console.log('%s %s   received: %s', (new Date()).toLocaleDateString('en-US'), (new Date()).toLocaleTimeString('en-US'), message);

    });

    ws.on('error', function (event) {
        console.log('WebSocket error: ', event);

        //() => ws.terminate();
    });
});


console.log('Server running.'
);

// ----------------------------------------------------------------------------------------

// Separate server to redirect from http to https
http.createServer(function (req, res) {
    //console.log(req.headers['host']+req.url);
    res.writeHead(301, {"Location": 'https://www.logeo.co' + req.url});
    res.end();
}).listen(HTTP_PORT);

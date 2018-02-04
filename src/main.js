let Buffer = require('buffer').Buffer;
let dgram = require('dgram');
let WebSocketServer = require('ws').Server;


let udpClient = dgram.createSocket('udp4');

let wss = new WebSocketServer({
	port: 32000
});

const SERVER_IP = process.env.WS_UDP_TARGET_IP || '127.0.0.1'
const SERVER_PORT = process.env.WS_UDP_TARGET_PORT || 32001

var websocket_connection = null;
console.log("WS-UDP proxy v0.0.1");
console.log("> Target: " + SERVER_IP + ":" + SERVER_PORT);

udpClient.on('message', (message, rinfo) => {
	// console.log("UDP Received:", message);
	try {
		if (websocket_connection) {
			websocket_connection.send(message);
		}
	} catch (err) {
		console.log(err);
		websocket_connection = null;
	}
});


wss.on('connection', (ws) => {
	websocket_connection = ws;
	websocket_connection.on('message', (message) => {
		let msgBuff = new Buffer(message);
		// console.log("WS Received", msgBuff);
		udpClient.send(msgBuff, 0, msgBuff.length, SERVER_PORT, SERVER_IP);
	});

	websocket_connection.on('error', (err) => {
	});
});

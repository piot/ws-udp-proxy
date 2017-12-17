let Buffer = require('buffer').Buffer;
let dgram = require('dgram');
let WebSocketServer = require('ws').Server;

let wss = new WebSocketServer({port: 32000});

const SERVER_IP = 'spelmotor.com'
const SERVER_PORT = 32000

wss.on('connection', (ws) => {
    let udpClient = dgram.createSocket('udp4');

    udpClient.on('message', (message, rinfo) => {
        console.log("UDP Received:", message);
        ws.send(message);
    });

    ws.on('message', (message) => {
        let msgBuff = new Buffer(message);
	console.log("WS Received", msgBuff);
        udpClient.send(msgBuff, 0, msgBuff.length, SERVER_PORT, SERVER_IP);
    });

    ws.on('error', (err) => {

    });
});

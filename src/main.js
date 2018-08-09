const Buffer = require('buffer').Buffer;
const dgram = require('dgram');
const https = require('https');
const ws = require('ws');
const WebSocketServer = ws.Server;
const fs = require('fs');

function createWebsocketServer(unsecureFlag) {
  var options;

  if (unsecureFlag) {
    options = {port: LISTEN_PORT};
  } else {
    const httpsServer = https.createServer({
      cert: fs.readFileSync('conf/certificate.pem'),
      key: fs.readFileSync('conf/privkey.pem'),
      port: LISTEN_PORT
    });
    httpsServer.listen(LISTEN_PORT);
    options = {server: httpsServer};
  }
  const wss = new WebSocketServer(options);

  return wss;
}

const LISTEN_PORT = 32001;
const unsecureFlag = process.env.WS_UDP_UNSECURE;
const SERVER_IP = process.env.WS_UDP_TARGET_IP || '127.0.0.1'
const SERVER_PORT = process.env.WS_UDP_TARGET_PORT || 32002

const wss = createWebsocketServer(unsecureFlag);
const udpClient = dgram.createSocket('udp4');
var websocket_connection = null;

console.log('WS-UDP proxy v0.0.2');
console.log('> Listen: ' + LISTEN_PORT);
console.log('> Target: ' + SERVER_IP + ':' + SERVER_PORT);
if (unsecureFlag) {
  console.log('-- Warning! Unsecure!');
}
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
    udpClient.send(msgBuff, 0, msgBuff.length, SERVER_PORT, SERVER_IP);
  });

  websocket_connection.on('error', (err) => {});
});

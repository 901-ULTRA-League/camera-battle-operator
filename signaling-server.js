// Minimal signaling relay for Camera Card Battle Operator
// Usage: npm install ws && node signaling-server.js
// The server fans out JSON messages to peers in the same room code.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8787;
const INDEX_PATH = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/index.html')) {
    fs.createReadStream(INDEX_PATH).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const wss = new WebSocketServer({ noServer: true });

function sendToRoom(ws, payload) {
  const code = payload && payload.code;
  if (code) {
    ws.lastCode = code;
  }
  wss.clients.forEach((client) => {
    if (client === ws) return;
    if (client.readyState !== 1) return;
    if (code && client.lastCode && client.lastCode !== code) return;
    client.send(JSON.stringify(payload));
  });
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      return;
    }
    sendToRoom(ws, payload);
  });

  ws.on('close', () => {
    ws.lastCode = null;
  });
});

server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/ws') {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT} (WS at /ws)`);
});

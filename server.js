// server.js
const WebSocket = require('ws');

// Create WebSocket server on port 8080
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
    console.log('A new client connected!');

    // Broadcast messages to all clients except the sender
    socket.on('message', message => {
        server.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

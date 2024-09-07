const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Serve the HTML file for testing
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Broadcast function to send messages to all clients
function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', ws => {
    console.log('New WebSocket connection');

    ws.on('message', message => {
        console.log('Received:', message);
        // Broadcast incoming message to all clients
        broadcast(message);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Start the server
const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on http://0.0.0.0:${PORT}`);
});

// script.js
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Variables for painting
let painting = false;
let brushColor = 'black';
let brushSize = 5;

// Connect to WebSocket server
const socket = new WebSocket('ws://192.168.1.252:8080/');

// Start painting
function startPainting(event) {
    painting = true;
    draw(event);
}

// Stop painting
function stopPainting() {
    painting = false;
    ctx.beginPath(); // Reset the path
}

// Draw on the canvas
function draw(event) {
    if (!painting) return;

    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Send drawing data to the server
    const drawingData = { x, y, color: brushColor, size: brushSize };
    socket.send(JSON.stringify(drawingData));
}

// Event listeners for painting
canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', draw);

// Receive drawing data from other clients via WebSocket
socket.onmessage = function(event) {
    // Check if the incoming data is a Blob
    if (event.data instanceof Blob) {
        event.data.text().then((text) => {
            try {
                const { x, y, color, size } = JSON.parse(text);
                drawFromMessage(x, y, color, size);
            } catch (error) {
                console.error('Error parsing JSON from Blob:', error);
            }
        }).catch(err => console.error('Error processing Blob:', err));
    } else {
        try {
            // Handle if data is directly in JSON string format
            const { x, y, color, size } = JSON.parse(event.data);
            drawFromMessage(x, y, color, size);
        } catch (error) {
            console.error('Error parsing JSON from string:', error);
        }
    }
};

// Helper function to draw from received data
function drawFromMessage(x, y, color, size) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// BEFOREUNLOAD event to close the WebSocket connection when leaving the page
window.addEventListener('beforeunload', function () {
    if (socket) {
        socket.close(); // Gracefully close the WebSocket connection
    }
});


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    socket.on('joinGame', (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Player",
            skinIdx: data.skinIdx || 0,
            x: 0,
            y: 0,
            angle: 0,
            score: 0,
            snake: []
        };
    });

    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id].name = data.name;
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
            players[socket.id].score = data.score;
            players[socket.id].skinIdx = data.skinIdx;
            players[socket.id].snake = data.snake;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('stateUpdate', { players: players });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
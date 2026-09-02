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
    console.log('Player connected:', socket.id);

    socket.on('joinGame', (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Player",
            skinIdx: data.skinIdx || 0,
            x: 0,
            y: 0,
            score: 0,
            snake: []
        };
    });

    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].score = data.score;
            players[socket.id].snake = data.snake;
            players[socket.id].name = data.name;
            players[socket.id].skinIdx = data.skinIdx;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

// 全プレイヤーへ毎秒20回位置情報を一括送信
setInterval(() => {
    io.emit('stateUpdate', { players: players });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
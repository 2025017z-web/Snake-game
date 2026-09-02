const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 静的ファイル（HTMLなど）を提供するフォルダ
app.use(express.static(__dirname));

let players = {};
let foods = [];

// マップ内に初期エサを配置
for (let i = 0; i < 300; i++) {
  foods.push({
    x: Math.random() * 3500,
    y: Math.random() * 3500,
    r: Math.random() * 2 + 4,
    col: `hsl(${Math.random() * 360}, 100%, 75%)`
  });
}

io.on('connection', (socket) => {
  console.log('プレイヤーが接続しました:', socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 1750,
    y: 1750,
    score: 0,
    snake: []
  };

  // 移動位置の同期
  socket.on('playerMove', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].angle = data.angle;
      players[socket.id].score = data.score;
      players[socket.id].snake = data.snake;
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

// 毎秒30回、全プレイヤーに最新の位置・エサ情報を一括送信
setInterval(() => {
  io.emit('stateUpdate', { players, foods });
}, 1000 / 30);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
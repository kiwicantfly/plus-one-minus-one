const express = require('express');
const { join } = require('node:path');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const PORT = 3000;
let GLOBAL_COUNTER = 0;
const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});
io.on('connection', (socket) => {
  console.log('a user connected');
  io.emit('update counter', GLOBAL_COUNTER);
  socket.on('incr', () => {
    GLOBAL_COUNTER++;
    io.emit('update counter', GLOBAL_COUNTER);
  });
  socket.on('decr', () => {
    GLOBAL_COUNTER = GLOBAL_COUNTER>0 ? GLOBAL_COUNTER-1 : 0;
      io.emit('update counter', GLOBAL_COUNTER);
  });
});
server.listen(PORT, () => {
  console.log("server running at http://localhost:3000");
});

const express = require('express');
const { join } = require('node:path');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const PORT = 3000;
const GLOBAL_COUNTER = 'global_counter';

const app = express();
const server = createServer(app);
const io = new Server(server);
const redis = new Redis(process.env.REDIS_URL);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', async (socket) => {
  console.log('a user connected');

  // Get counter if first connection
  try {
    const currentValue = await redis.get(GLOBAL_COUNTER) || 0;
    io.emit('update counter', parseInt(currentValue));
  } catch (err) {
    console.error('Erreur Redis get counter value:', err);
  }

  // +1
  socket.on('incr', async () => {
    try {
      // Incr is an axtomic operation with Redis
      const newValue = await redis.incr(GLOBAL_COUNTER);
      io.emit('update counter', newValue);
    } catch (err) {
      console.error('Erreur Redis incr:', err);
    }
  });

  // -1
  socket.on('decr', async () => {
    try {
      let newValue = await redis.decr(GLOBAL_COUNTER);
      if (newValue < 0) {
        await redis.set(GLOBAL_COUNTER, 0);
        newValue = 0;
      }
      io.emit('update counter', newValue);
    } catch (err) {
      console.error('Erreur Redis decr:', err);
    }
  })
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/winston.logger');

let io = null;
let server = null;

function createServer(app) {
  server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  });

  // Socket.IO authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWTSECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.api.debug(`Socket connected: user ${userId} (${socket.id})`);
    socket.join(`user-${userId}`);

    socket.on('disconnect', () => {
      logger.api.debug(`Socket disconnected: user ${userId} (${socket.id})`);
    });
  });

  return server;
}

function getIo() {
  if (!io) throw new Error('Socket.IO not initialized. Call createServer() first.');
  return io;
}

function getServer() {
  if (!server) throw new Error('Server not initialized. Call createServer() first.');
  return server;
}

module.exports = { createServer, getIo, getServer };

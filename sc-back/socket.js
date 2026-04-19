const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/winston.logger');

function parseCookie(cookieStr) {
  if (!cookieStr) return {};
  const cookies = {};
  cookieStr.split(';').forEach(c => {
    const [key, ...rest] = c.trim().split('=');
    if (key) cookies[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

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

  // Socket.IO authentication - supports both token from handshake auth and cookie
  io.use((socket, next) => {
    let token = socket.handshake.auth.token;

    // Fallback: read token from cookie (for httpOnly cookies sent through proxy)
    if (!token && socket.handshake.headers.cookie) {
      const cookies = parseCookie(socket.handshake.headers.cookie);
      token = cookies.token;
    }

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

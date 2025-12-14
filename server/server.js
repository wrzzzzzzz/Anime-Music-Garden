const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const { connectDB, setupChangeStream } = require('./db/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const checkInRoutes = require('./routes/checkins');
const animeRoutes = require('./routes/anime');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection - only connect if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    // Setup MongoDB Change Stream after connection
    setupChangeStream(io);
  }).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
}

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'UserId:', socket.userId);

  socket.on('join-garden', (userId) => {
    if (socket.userId === userId) {
      socket.join(`garden-${userId}`);
      console.log(`User ${userId} joined their garden`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/anime', animeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from client build (for production)
const serverPath = process.env.SERVER_DIR || __dirname;
const clientBuildPath = path.join(serverPath, '../client/dist');

// Serve static files from client build directory
app.use(express.static(clientBuildPath));

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  // If it's an API route, return 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  // Otherwise, serve the React app
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Only start server if not in test environment and if this file is run directly
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please either:`);
      console.error(`1. Stop the process using port ${PORT}`);
      console.error(`2. Set a different port in your .env file: PORT=5001`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

module.exports = { app, server, io };


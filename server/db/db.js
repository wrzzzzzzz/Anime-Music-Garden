const mongoose = require('mongoose');

let changeStream = null;

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden';
    
    // If using MongoDB Atlas (mongodb+srv://), ensure database name is included
    if (mongoURI.startsWith('mongodb+srv://') && !mongoURI.includes('/?') && !mongoURI.match(/\/[^/?]+(\?|$)/)) {
      // Add database name if not present
      const dbName = 'anime-music-garden';
      if (!mongoURI.endsWith('/')) {
        mongoURI += '/';
      }
      mongoURI += dbName;
    }
    
    const conn = await mongoose.connect(mongoURI, {
      // MongoDB Atlas connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Setup MongoDB Change Stream for CheckIn collection
const setupChangeStream = (io) => {
  if (changeStream) {
    changeStream.close();
  }

  // Ensure CheckIn model is loaded
  const CheckIn = require('../models/CheckIn');
  
  // Watch for changes in CheckIn collection
  changeStream = CheckIn.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', (change) => {
    console.log('Change detected:', change.operationType);
    
    if (change.operationType === 'insert') {
      const checkIn = change.fullDocument;
      if (checkIn && checkIn.user) {
        io.to(`garden-${checkIn.user}`).emit('new-flower', {
          checkIn: checkIn
        });
      }
    } else if (change.operationType === 'update') {
      const checkIn = change.fullDocument;
      if (checkIn && checkIn.user) {
        io.to(`garden-${checkIn.user}`).emit('flower-updated', {
          checkIn: checkIn
        });
      }
    } else if (change.operationType === 'delete') {
      const userId = change.documentKey?.user;
      const checkInId = change.documentKey?._id;
      if (userId) {
        io.to(`garden-${userId}`).emit('flower-removed', {
          checkInId: checkInId
        });
      }
    }
  });

  changeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });

  console.log('MongoDB Change Stream initialized');
};

module.exports = { connectDB, setupChangeStream };


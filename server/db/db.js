const mongoose = require('mongoose');

let changeStream = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden');
    console.log(`MongoDB connected: ${conn.connection.host}`);
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


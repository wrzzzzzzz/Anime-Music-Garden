const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['anime', 'opening', 'ending', 'insert']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  animeTitle: {
    type: String,
    trim: true
  },
  animeId: {
    type: Number
  },
  animeImage: {
    type: String,
    default: null
  },
  episode: {
    type: Number
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'excited', 'calm', 'nostalgic', 'energetic', 'melancholic', 'inspired']
  },
  notes: {
    type: String,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Flower properties for visualization
  flowerSize: {
    type: Number,
    required: true,
    min: 0.5,
    max: 2.0
  },
  position: {
    x: {
      type: Number,
      default: () => Math.random() * 100
    },
    y: {
      type: Number,
      default: () => Math.random() * 100
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
checkInSchema.index({ user: 1, date: -1 });
checkInSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('CheckIn', checkInSchema);


const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate favorites
favoriteSchema.index({ user: 1, car: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);


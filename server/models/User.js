const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  interactions: {
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product'
    },
    views: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product'
    },
    purchases: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product'
    }
  }
});

module.exports = mongoose.model('User', userSchema);

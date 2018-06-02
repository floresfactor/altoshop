const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ErrLogSchema = new Schema({
  request: {
    type: Object,
  },
  error: {
    type: Object,
  },
  stackTrace: {
    type: String,
  },
  message: {
    type: String,
  },
  happenedAt: {
    type: Date,
    default: () => Date.now(),
    required: true,
  },
});

module.exports = mongoose.model('ErrLog', ErrLogSchema);

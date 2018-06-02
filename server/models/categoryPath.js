const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategoryPathSchema = new Schema({
  categoryID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }, 
  path: {
    type: [Schema.Types.ObjectId],
    min: 0,
  },
});

module.exports = mongoose.model('CategoryPath', CategoryPathSchema);

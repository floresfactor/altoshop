const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
  tag: {
    type: String,
    required: true
  },
  image: {
    name: {
        type: String
    },
    src: {
        type: String
    }
  },
  type: {
    type: String,
    enum: ['primary', 'secondary','complement1', 'complement2', 'complement3', 'complement4'],
    unique: true
  }
});

BannerSchema.statics = {
  listAll(options) {
     const criteria = options.criteria || {}; 
     const page = Number(options.page) || 0;
     const limit = Number(options.limit) || 20;

     return this.find(criteria)
         .sort({ createdAt: -1 })
         .limit(limit)
         .skip(limit * page)
         .exec();
 },
};
BannerSchema.plugin(uniqueValidator, { message: '{PATH} is already registered.' });

module.exports = mongoose.model('Banner', BannerSchema);
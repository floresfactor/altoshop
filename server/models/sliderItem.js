const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const idvalidator = require('mongoose-id-validator');

const SliderItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  productGroup: {
    name:{
      type: String,
      required: true
    },
    link:{
      type: String,
      required: true
    }
  },
  link:{
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
  }
});

SliderItemSchema.statics = {
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

SliderItemSchema.plugin(idvalidator);
SliderItemSchema.plugin(uniqueValidator);

module.exports = mongoose.model('SliderItems',SliderItemSchema);
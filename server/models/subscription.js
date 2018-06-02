const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const SubscriptionSchema = new Schema ({
  email: {
    type: String,
        validate: {
            validator: function (v) {
                const t = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return t.test(v);
            },
            message: "{VALUE} is not a valid email"
        },
        required: true,
        unique: true
  },
  createdAt: {
    type: Date,
    default: function() {
        return Date.now();
    },
    required: true
  },
  customerFirstName:{
      type: String,
      validate: {
        validator: function (value) {
           return value ? value.length > 2 : false;
        },
        message: "{VALUE} length must be at least 3 characters"
    }
  },
  customerLastName:{
    type: String,
    validate: {
      validator: function (value) {
         return value ? value.length > 2 : false;
      },
      message: "{VALUE} length must be at least 3 characters"
    }
  },
  customerID:{
      type: Schema.Types.ObjectId
  }
});

SubscriptionSchema.plugin(uniqueValidator, { message: "{PATH} is already registered." });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
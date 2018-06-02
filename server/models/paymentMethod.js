const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const idvalidator = require('mongoose-id-validator');

const PaymentMethodSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    required: true,
    enum: ['card'], // <-- Currently only supporting card payments
  },
  reference: {
    type: String,
  },
  last4: {
    type: String,
  },
  expMonth: {
    type: Number,
  },
  expYear: {
    type: Number,
  },
  brand: {
    type: String,
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
  externalReference: {
    type: String,
  },
});

PaymentMethodSchema.plugin(idvalidator);
PaymentMethodSchema.plugin(deepPopulate);

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);

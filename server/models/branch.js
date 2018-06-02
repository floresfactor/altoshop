const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AddressSchema = require('./schema/address');
const generateValidationNativeError = require('../lib/generateErrors').generateValidationNativeError;
const moment = require('moment');

const ServiceTime = new Schema({
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
});

const BranchSchema = new Schema({
  name: {
    type: String,
  },
  address: AddressSchema,
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
  timeZone: {
    type: String,
    required: true,
  },
  serviceTime: {
    type: [ServiceTime],
    required: true,
    min: 1,
  },
});

// Validate there aren't 2 braches with the same name on save
BranchSchema.pre('save', function (next) {
  this.constructor.findOne({ name: this.name }).then(doc => {
    if (doc) { next(generateValidationNativeError('Repeated document', [{ message: "There's already a branch with the same name", propertyName: 'name' }])); } else { next(); }
  });
});

ServiceTime.path('from').set(function (time) {
  const from = moment(time, 'HH:mm', true);
  if (from.isValid()) { return this.from = from; }
});

ServiceTime.path('to').set(function (time) {
  const to = moment(time, 'HH:mm', true);
  if (to.isValid()) { return this.to = to; }
});

module.exports = mongoose.model('Branch', BranchSchema);

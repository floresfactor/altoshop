const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const moment = require('moment');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const mongoosePaginate = require('mongoose-paginate');

const Product = require('../models/product');
const ProductGroup = require('../models/productGroup');

const DiscountSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  claimType: {
    type: String,
    enum: ['coupon', 'none'],
    required: true,
  },
  applicationType: {
    type: String,
    enum: ['totalSale'],
    required: true,
  },
  code: {
    type: String,
  },
  amount: {
    type: Number,
    min: 1,
    required: true,
  },
  amountType: {
    type: String,
    enum: ['percentage'],
  },
  enabled: {
    type: Boolean,
    default: false,
    required: true,
  },
  items: [{
    itemId: Schema.Types.ObjectId,
    kind: {
      type: String,
      enum: ['product', 'productGroup'],
    },
  }],
  validUntil: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
});

DiscountSchema.pre('save', function (next) {
  if (this.code) { this.code = this.code.toUpperCase(); }

  if (moment(this.validUntil).isBefore(moment())) { this.enabled = false; }

  next();
});

DiscountSchema.post('save', (doc) => {
  console.log(doc);
});

DiscountSchema.methods = {
  populateFields(populateFieldsArr, options) {
    return this.deepPopulate(populateFieldsArr || [], options || null);
  },
  populateProducts() {
    const discount = this;
    const products = [];

    discount.items.forEach((item) => {
      if (item.kind == 'product') {
        products.push(mongoose.Types.ObjectId(item.itemId));
      }
    }, this);

    return Product.find({ _id: { $in: products } }).then(mongoProds => {
      discount._doc.products = mongoProds;

      return Promise.resolve();
    });
  },
  populateGroups() {
    const discount = this;
    const productGroups = [];

    discount.items.forEach((item) => {
      if (item.kind == 'productGroup') {
        productGroups.push(mongoose.Types.ObjectId(item.itemId));
      }
    }, this);

    return ProductGroup.find({ _id: { $in: productGroups } }).then(mongoProds => {
      discount._doc.productGroups = mongoProds;

      return Promise.resolve();
    });
  },
};

DiscountSchema.plugin(deepPopulate);
DiscountSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Discount', DiscountSchema);

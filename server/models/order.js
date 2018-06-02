const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const mongoosePaginate = require('mongoose-paginate');
const conekta = require('conekta');
const tZ = require('moment-timezone');

const ErrorGen = require('../lib/generateErrors');
const appSettings = require('../settings').appSettings;

// Model
const Product = require('./product');
const ProductHistory = require('./productHistory');

// Schema
const AddressSchema = require('./schema/address');
const DiscountSchema = require('./discount').schema;

// This registers a payment on external API based on charges for individual items
// stored as a reference in itemChargeConcepts as:
//
// concepts = [{
//     orderItem: the particular order.$.orderItem this payment includes
//     itemCharge: the itemCharge object this payment covers in orderItem
// }]
//
// It's given that payment.amount === summatoryOf(concepts.$.itemCharge.amount)
const OrderPaymentSchema = new Schema({
  amount: {
    type: Number,
    min: 1,
    required() {
      return !!this.externalReference;
    },
  },
  type: {
    type: String,
    enum: ['card', 'oxxo_cash'],
    required: true,
  },
  paymentMethod: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required() {
      return this.type == 'card';
    },
  },
  externalReference: {
    type: String,
  },
  paymentReference: {
    type: String,
  },
  concepts: {
    type: [{
      orderItem: Schema.Types.ObjectId,
      itemCharge: Schema.Types.ObjectId,
    }],
    required() {
      return this.status === 'PAID';
    },
    min: 1,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID'],
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
});
// Individual charges for items
// Store a reference to an payment of type OrderPaymentSchema for when this charge
// has already being covered/applied per an external API request.
const ItemChargeSchema = new Schema({
  amount: {
    type: Number,
    min: 1,
    required: true,
  },
  payment: {
    type: Schema.Types.ObjectId,
    required() {
      return this.status == 'PAID';
    },
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID'],
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
});

// Includes the original order items with their applied disccounts registered in price
// and the registered charges for every one of them.
// It's given that order.total === summatoryOf((items.discountPrices * items.price) * items.quantity)
const OrderItemSchema = new Schema({
  itemID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    min: 1,
    required: true,
  },
  type: {
    type: String,
    enum: ['product', 'package'],
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  charges: {
    type: [ItemChargeSchema],
    required: true,
    min: 1,
  },
});

const addressedToSchema = new Schema({
  firstName: {
    type: String,
    minlength: [3, 'Name length must be at least 3 characters'],
    required: true,
  },
  lastName: {
    type: String,
    minlength: [3, 'Last name length must be at least 3 characters'],
    required: true,
  },
    email: {
    type: String,
    required: [true, 'Email is required'],
  },
  phone: {
    type: String,
    require: true,
  },
});

const ShipmentSchema = new Schema({
  type: {
    type: String,
    enum: ['pickup', 'ship'],
    required: true,
  },
  address: {
    type: AddressSchema,
    required: true,
  },

  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required() {
      return this.type == 'pickup';
    },
  },
  dateTime: {
    type: Date,
    required: true,
  },
});

const OrderSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    set(val) {
      return appSettings.CURRENCY;
    },
    default() {
      return appSettings.CURRENCY;
    },
    required: true,
  },
  total: {
    type: Number,
    min: 1,
    required: true,
  },
  payments: {
    type: [OrderPaymentSchema],
    min: 1,
  },
  discounts: [DiscountSchema],
  status: {
    type: String,
    enum: ['PENDING', 'PAID'],
  },
  shipment: {
    type: ShipmentSchema,
    required: true,
  },
  addressedTo: {
    type: addressedToSchema,
    required: true,
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
  updatedAt: {
    type: Date,
  },
  externalReference: {
    type: String,
  },
});

const commonSaveLogic = (orderCtx) => {
  orderCtx.updatedAt = Date.now();
};

OrderSchema.pre('validate', function (next) {
  if (this.shipment && this.shipment.dateTime) {
    this.deepPopulate('shipment.branch').then(doc => {
      const timeZone = doc.shipment.branch.timeZone;
      const dateTime = doc.shipment.dateTime;
      if (tZ(dateTime, timeZone).isBefore(tZ().tz(timeZone))) {
        const err = new Error('Shipment date is before of branch current time');
        next(err);
      } else { next(); }
    }).catch(error => {
      next(error);
    });
  } else {
    const err = new Error('No dateTime found on shipment');
    next(err);
  }
});

OrderSchema.pre('save', function (next) {
  // Validate all status are set by the time of saving
  if (!this.status) { return next(ErrorGen.generateValidationErrors([{ message: 'status field is required', propertyName: 'status' }])); }
  if (this.payments.some(payment => !payment.status)) { return next(ErrorGen.generateValidationErrors([{ message: 'status field is required', propertyName: 'payments' }])); }
  if (this.items.some(item => item.charges.some(charge => !charge.status))) { return next(ErrorGen.generateValidationErrors([{ message: 'status field is required', propertyName: 'items.$.charges' }])); }

  // Validate references
  if (this.payments.some(p => !p.externalReference)) { return next(ErrorGen.generateValidationErrors([{ message: 'externalReference field is required', propertyName: 'payments' }])); }
  if (this.payments.some(p => p.type == 'oxxo_cash' && !p.paymentReference)) { return next(ErrorGen.generateValidationErrors([{ message: 'paymentReference field is required when type is oxxo_cash', propertyName: 'payments' }])); }

  next(commonSaveLogic(this));
});

OrderSchema.pre('update', function (next) {
  next(commonSaveLogic(this));
});

OrderItemSchema.virtual('populatedOrderItems').set(function (items) {
  this.populatedOrderItems = items;
});

OrderItemSchema.virtual('preUpdateItemStocks').set(function (preUpdateItemStocksArr) {
  this.preUpdateItemStocks = preUpdateItemStocksArr;
});

OrderSchema.statics = {
  listPaginated(options) {
    const findQuery = options.filterBy || {};
    const currentPage = Number(options.currentPage) || 1;
    const pageSize = Number(options.pageSize) || 15;
    const sort = options.sortBy || { createdAt: -1 };

    return this.paginate(findQuery, { page: currentPage, limit: pageSize, sort });
  },

  // Filter by customer
  // Returns object as: { results: docs, count}
  getOrdersfilteredByCustomer(options) {
    const filter = options.filterBy.customer;
    const currentPage = Number(options.currentPage) || 1;
    const pageSize = Number(options.pageSize) || 15;
    const sort = options.sortBy || { createdAt: -1 };

    return this.find({})
      .sort(sort)
      .populate({
        path: 'customer',
        select: ['firstName', 'lastName'],
      }).then(docs => {
        const reg = new RegExp(filter, 'gi');
        const matches = [];

        for (let i = 0; i < docs.length; i++) {
          if (docs[i].customer && (`${docs[i].customer.firstName} ${docs[i].customer.lastName}`).match(reg)) { matches.push(docs[i]); }
        }

        return {
          count: matches.length,
          results: matches.slice(currentPage > 0 ? (currentPage - 1) * pageSize : 0, currentPage * pageSize),
        };
      });
  },
};

OrderSchema.methods = {
  populateFields(populateFieldsArr, options) {
    return this.deepPopulate(populateFieldsArr || [], options || null);
  },

  // Returns the populated order products OR package(s) from DB
  getPopulatedOrderItems() {
    const fetchItems = [];

    this.items.forEach((item, idx) => {
      if (item.type === 'product') {
        fetchItems.push(new Promise((resolve, reject) => Product.findById(item.itemID).then(product => {
          if (!product) {
            // Product was not found
            const errArr = [{
              message: `Product ${item.itemID} not found.`,
              propertyName: `items.$${idx}`,
            }];

            return Promise.reject(ErrorGen.generateValidationErrors(errArr));
          }
          return resolve(product);
        }).catch(errs => {
          reject(errs);
        })));
      } else if (item.type === 'package') {
        throw 'NOT IMPLEMENTED'; // TODO
      } else {
        throw 'Invalid item.type enum at order';
      }
    });

    return Promise.all(fetchItems);
  },

  // Gets the order items into order, from record
  //  !!!! IMPORTANT NOTE: This returns a non-mongoose object !!!!
  populateOrderFromRecord() {
    const orderObj = this.toObject();
    const fetchItems = [];

    this.items.forEach((item, idx) => {
      if (item.type === 'product') {
        fetchItems.push(new Promise((resolve, reject) => ProductHistory.findById(item.itemID).then(productRecord => {
          if (!productRecord) {
            const errArr = [{
              message: `Product ${item.itemID} not found.`,
              propertyName: `items.$${idx}`,
            }];

            return Promise.reject(ErrorGen.generateValidationErrors(errArr));
          }
          orderObj.items[idx].item = productRecord;
          resolve();
        }).catch(errs => {
          reject(errs);
        })));
      } else if (item.type === 'package') {
        throw 'NOT IMPLEMENTED'; // TODO
      } else {
        throw 'Invalid item.type enum at order';
      }
    });

    return Promise.all(fetchItems).then(() => orderObj);
  },

  // 1. Persists order history for previoully fetched (and populated) order items
  // 2. Updates the current order.items to point to the history records instead of the actual DB item
  generateOrderRecords() {
    const items = this.items;
    const populatedOrderItems = this.populatedOrderItems;
    const promiseArr = [];

    items.forEach(orderItem => {
      if (orderItem.type === 'product') {
        promiseArr.push(new Promise((resolve, reject) => {
          const dbProduct = populatedOrderItems.find(dbItem => dbItem._id.toString() == orderItem.itemID);

          const productRecord = new ProductHistory({
            name: dbProduct.name,
            price: dbProduct.price,
            oldStock: (dbProduct.inventariable && dbProduct.stock) || null,
            stock: (dbProduct.inventariable && (dbProduct.stock - orderItem.quantity)) || null,
            sku: dbProduct.sku,
            reason: 'ORDER',
          });

          return productRecord.save().then(record => {
            orderItem.itemID = record.id;
            resolve();
          }).catch(errs => {
            reject(errs);
          });
        }));
      } else if (orderItem.type === 'package') {
        throw 'NOT IMPLEMENTED'; // TODO
      } else {
        throw 'Invalid item.type enum at order';
      }
    });

    return Promise.all(promiseArr);
  },

  // Validates mongoose schema
  validateSchema() {
    const order = this;
    const errsArr = [];

    if (order.isNew) {
      // Don't allow more than one charge per item when creating orders
      order.items.forEach((i, idx) => {
        if (i.charges.length > 1) { errsArr.push({ message: 'More than one charge on items', propertyName: `items.$.${idx}.charges` }); }
      });

      // Don't allow multiple charges for new orders
      if (order.payments.length > 1) { errsArr.push({ message: 'Multiple charges not allowed when creating orders', propertyName: 'payments' }); }
    }

    if (errsArr.length) { return Promise.reject(ErrorGen.generateValidationErrors(errsArr)); }

    // Validate client-order first, order.total will be set later (set it here to pass validation)
    order.total = 1;
    return this.validate().then(() => {
      this.total = 0;
      return Promise.resolve();
    });
  },

  // 1. Populates and validates order customer
  // 2. Checks that order customer is created in external api, and if it's not creates it
  validateCustomer() {
    return this.populateFields(['customer']).then(order => {
      const errsArr = [];
      let createOnExternalPromise = Promise.resolve();

      if (!order.customer || !order.customer.id || !order.customer.externalReference) { errsArr.push({ message: 'Customer not found in DB', propertyName: 'customer' }); }

      if (!errsArr.length && !order.customer.externalReference) {
        createOnExternalPromise = order.customer.createExternal.bind(order.customer);
      }

      return errsArr.length === 0 ? createOnExternalPromise : Promise.reject(ErrorGen.generateValidationErrors(errsArr));
    });
  },

  // Validates that order items exist and have enough stock
  validateItemsStock() {
    const errsArr = [];
    const order = this;

    // Get items and validate existence
    return order.getPopulatedOrderItems().then(itemsArr => {
      if (itemsArr.length !== order.items.length) {
        errsArr.push({ message: 'Items number mismatch between order.items and DB retrieved', propertyName: 'order.items' }); // <- This won't actually ever happen (shouln't..)
        return;
      }

      // Validate stocks
      itemsArr.forEach(dbItem => {
        const orderItem = order.items.find(i => i.itemID == dbItem.id);

        if (!orderItem) {
          errsArr.push({ message: `Items mismatch between order.items and item id ${dbItem.id}`, propertyName: `items.$.${order.items.indexOf(orderItem)}` }); // <- This won't actually ever happen (shouldn't..)
        }

        if (dbItem.inventariable && orderItem.quantity > dbItem.stock) {
          errsArr.push({
            message: `Item ${orderItem.itemID} out of stock`,
            propertyName: `items.$.${order.items.indexOf(orderItem)}`,
          });
        }
      });

      if (!errsArr.length) { order.populatedOrderItems = itemsArr.map(i => i.toObject()); }

      return errsArr.length === 0 ? Promise.resolve() : Promise.reject(ErrorGen.generateValidationErrors(errsArr));
    });
  },

  // Validates and applies discounts on the order, if any
  // Updates order information related to this changes, if necessary
  // Note: It's expected that virual populatedOrderItems is set in order when getting to this
  //
  // Validation is performed comparing client-side received data on order against populatedOrderItems (items coming from DB)
  validateItemPrices() {
    const order = this;
    const errsArr = [];

    // Validate order items from client against their base prices/discounts
    order.populatedOrderItems.forEach(dbItem => {
      const orderItem = order.items.find(i => i.itemID.toString() == dbItem._id);

      // Validate item base price
      if (dbItem.price != orderItem.price) {
        errsArr.push({
          message: `Item ${orderItem.itemID} has a price mismatch`,
          propertyName: `items.$.${order.items.indexOf(orderItem)}`,
        });
      }
    });

    // Cut the flow here if there were price mismatches
    if (errsArr.length) { return Promise.reject(ErrorGen.generateValidationErrors(errsArr)); }

    return order.validateDiscounts().then(() => {
      // Prices and discounts are valid up to this point
      order.total = (order.items.map(i => (i.discountPrice || i.price) * i.quantity).reduce((a, b) => a + b)).toFixed(2);
      return Promise.resolve();
    });
  },

  validateDiscounts() {
    const order = this;
    const errsArr = [];

    if (!(order.discounts && order.discounts.length)) { return Promise.resolve(); }

    return Promise.all(order.discounts.map(d => new Promise((resolve, reject) => {
      mongoose.model('Discount').findById(d._id).then(doc => {
        if (!doc) { return reject(`Discount id ${d._id} not found.`); }

        return resolve(doc);
      });
    }))).then(populatedDiscounts => {
      // Discounts applying as a percentage over totalSale
      const orderTotalDiscountAmountPct = populatedDiscounts.filter(d => d.applicationType == 'totalSale' && d.amountType == 'percentage')
        .map(d => d.amount).reduce((a, b) => a + b);

      // Validate order items from client against their discounts
      order.populatedOrderItems.forEach(dbItem => {
        const orderItem = order.items.find(i => i.itemID.toString() == dbItem._id);

        const dbItemDiscountPrice = (dbItem.price - (dbItem.price * (orderTotalDiscountAmountPct * 0.01))).toFixed(2);
        // Is the charge we are getting from client different from what we are calculating on server?
        if (!orderItem.discountPrice || Math.abs(orderItem.discountPrice - dbItemDiscountPrice) > Number.EPSILON) {
          errsArr.push({
            message: `Item ${orderItem.itemID} has a discount price mismatch based registered price/discounts`,
            propertyName: `items.$.${order.items.indexOf(orderItem)}`,
          });
        }
      });

      return errsArr.length === 0 ? Promise.resolve() : Promise.reject(ErrorGen.generateValidationErrors(errsArr));
    });
  },

  // Validate item charges
  // It's inferred that prices had been updated/validated upon getting to this method
  // It's inferred that discounts had been applied and validated upon getting to this method
  validateOrderItemsCharges() {
    const order = this;
    // Todo: This is hardcoded
    const allowedMinPartialPaymentPercentagePerItem = 0.20;
    const errsArr = [];

    order.items.forEach((i, idx) => {
      // Set status for item charges not paid
      i.charges.filter(c => !c.payment).forEach(itemCharge => itemCharge.status = 'PENDING');

      const notTakenChargesAmounts = i.charges.filter(itemCharge => itemCharge.status === 'PENDING').map(c => c.amount);
      const takenChargesAmounts = i.charges.filter(itemCharge => itemCharge.payment).map(c => c.amount); // <-- Same as itemCharge => itemCharge.status === 'PAID'

      // Validate at least the allowedPartialPayment is being taken for each item
      if (notTakenChargesAmounts.some(amt => amt < (((i.discountPrice || i.price) * allowedMinPartialPaymentPercentagePerItem) * i.quantity).toFixed(2))) { errsArr.push({ message: `Partial payment has to be at least ${allowedMinPartialPaymentPercentagePerItem} percent of item price`, propertyName: `items.$.${idx}.charges` }); }

      // Validate that charges don't exceed the item total price to take
      if (takenChargesAmounts.length > 1) {
        if (takenChargesAmounts.reduce((a, b) => a + b) + notTakenChargesAmounts.reduce((a, b) => a + b) > ((i.discountPrice || i.price) * i.quantity)) { errsArr.push({ message: 'Item charges exceed original payment amount', propertyName: 'items.$.charges' }); }
      }
    });

    return errsArr.length === 0 ? Promise.resolve() : Promise.reject(ErrorGen.generateValidationErrors(errsArr));
  },

  // It's inferred that order items stocks have been validated upon reaching here

  deductItemsStock() {
    const order = this;

    // Save record of stock-modifying operations
    order.preUpdateItemStocks = [];
    const deductStcokPromises = [];

    order.items.forEach(orderItem => {
      if (orderItem.type === 'product') {
        deductStcokPromises.push(new Promise((resolve, reject) => Product.findOneAndUpdate({ _id: orderItem.itemID, inventariable: true }, {
          $inc: { stock: -(orderItem.quantity || 0) },
        }).then(preUpdateProduct => {
          // Item is not inventariable
          if (!preUpdateProduct) { return resolve(); }

          // Add to updated records
          order.preUpdateItemStocks.push({
            itemID: preUpdateProduct._id.toString(),
            stock: preUpdateProduct.stock,
          });

          return resolve();
        }).catch((errs) => reject(errs))));
      } else if (orderItem.type === 'package') {
        throw 'NOT IMPLEMENTED'; // TODO
      }
    });

    return Promise.all(deductStcokPromises).then(() => Promise.resolve()).catch(errs =>
      // Todo: log/do smt with errs here
      order.rollbackItemStocks(errs)
    );
  },

  // Rollback stocks when an error occurs after deductingItemStocks
  // It's inferred that preUpdateItemStocks is present and filled in order
  rollbackItemStocks(errs) {
    const order = this;
    const rollbackStockPromises = [];

    // Rollback changes when any error happens here
    order.items.forEach(orderItem => {
      const preUpdateItem = order.preUpdateItemStocks.find(i => i.itemID == orderItem.itemID);

      if (!preUpdateItem) { return; }

      const preUpdateItemStock = preUpdateItem.stock;

      if (orderItem.type === 'product') {
        rollbackStockPromises.push(new Promise((resolve, reject) => Product.findOneAndUpdate({ _id: orderItem.itemID }, {
          $set: { stock: preUpdateItemStock },
        }).then(() => resolve()).catch(() => reject())));
      } else if (orderItem.type === 'package') {
        throw 'NOT IMPLEMENTED'; // TODO
      }
    });

    // Todo: is there something else we can/should do here (besides logging)?
    // The result of this always rejects
    return Promise.all(rollbackStockPromises).then(() => Promise.reject()).catch(() => Promise.reject(errs || 'An error occurred when deducting/restoring order item stocks'));
  },

  // Validates customer and order payment method for an order external charge
  validatePaymentData(payment) {
    const order = this;
    const errsArr = [];

    if (!order.customer._id) { errsArr.push({ message: 'Customer not found in order', propertyName: 'customer' }); }

    if (!~order.payments.indexOf(payment)) { errsArr.push({ message: 'Charge not found in order', propertyName: 'charges' }); }

    if (errsArr.length) { return Promise.reject(ErrorGen.generateValidationErrors(errsArr)); }

    // Validation ends here for oxxo payments
    if (payment.type == 'oxxo_cash') { return Promise.resolve(); }

    // Find and populate paymentMethod
    return mongoose.model('PaymentMethod').findById(payment.paymentMethod).then(paymentMethod => {
      if (!paymentMethod || !paymentMethod.externalReference) { errsArr.push({ message: 'PaymentMethod not created/found', propertyName: 'paymentMethod' }); }

      if (!(paymentMethod.customer == order.customer.id)) { errsArr.push({ message: 'PaymentMethod - Customer mismatch', propertyName: 'paymentMethod' }); }

      payment.paymentMethod = paymentMethod;

      return errsArr.length === 0 ? Promise.resolve() : Promise.reject(ErrorGen.generateValidationErrors(errsArr));
    });
  },

  // Registers an order on external payments API, this order will be a charge in our order.payments array
  // It's inferred that all related items (charge parameter included) are populated as required
  // It's inferred that order and all it's related items is fully validated and updated upon getting here
  // payment is created based in the itemCharges received, inferred they are validated already
  createExternalPayment(payment, itemCharges) {
    const order = this;
    const errsArr = [];

    if (!~order.payments.indexOf(payment)) { return Promise.reject(ErrorGen.generateValidationErrors([{ message: 'Charge not found in order', propertyName: 'charges' }])); }

    if (payment.externalReference) { return Promise.reject(ErrorGen.generateValidationErrors([{ message: 'Charge was already created on external API', propertyName: `charges.$.${order.payments.indexOf(payment)}` }])); }

    const totalAmountToCharge = itemCharges.map(c => c.amount).reduce((a, b) => a + b);
    payment.amount = totalAmountToCharge;
    payment.status = 'PENDING';

    // Validate we are not charging more than the order total
    const completePayments = order.payments.filter(p => p.status == 'PAID');
    if (completePayments.length) {
      const orderTotalPaid = completePayments.map(payment => payment.amount).reduce((a, b) => a + b);
      if (orderTotalPaid + totalAmountToCharge > order.total) { errsArr.push({ message: 'Order paid already / excedent charge amount', propertyName: `charges.$${order.payments.indexOf(payment)}` }); }
    }

    const external_customerInfo = {
      customer_id: order.customer.externalReference,
    };

    // Getting line items from the updated order
    const externalLineItems = [{
      name: `Charge per order id${order._id}, payment id: ${payment._id}`,
      unit_price: Math.trunc(totalAmountToCharge * 100),
      quantity: 1,
    }];

    // Getting order charges
    const external_charges_payment_method = {
      payment_method: {
        type: payment.type,
        amount: Math.trunc(totalAmountToCharge * 100),
      },
    };

    if (payment.type === 'card') {
      external_charges_payment_method.payment_method.payment_source_id = payment.paymentMethod.externalReference;
    }

    const external_charges = [external_charges_payment_method];

    return new Promise((resolve, reject) => {
      // Create order on external API
      conekta.Order.create({
        currency: order.currency,
        customer_info: external_customerInfo,
        line_items: externalLineItems,
        charges: external_charges,
      }, (err, conektaOrder) => {
        // TODO: Do smt usefull with this error (as showing it to customer for example...)
        if (err) {
          return reject(err);
        }

        payment.externalReference = conektaOrder._id;

        const conektaOrderObj = conektaOrder.toObject();
        const conektaPaymentMethod = conektaOrderObj.charges.data[0].payment_method;

        if (conektaPaymentMethod.type == 'oxxo') { payment.paymentReference = conektaPaymentMethod.reference; }

        // Set that, the received itemCharges will be covered by this payment
        itemCharges.forEach(i => {
          i.payment = payment._id;
          i.status = 'PENDING'; // <-- This is actually set also in validateOrderItemCharges
        });

        if (!order.isNew) { return order.save(); }

        return resolve();
      });
    });
  },

  removeOrderItemsFromCustomerCart() {
    const order = this;

    return mongoose.model('Customer').update({ _id: order.customer.id },
      { $pull: { cartItems: { itemID: { $in: order.items.map(i => i.itemID.toString()) } } } },
      { multi: true }
    ).exec();
  },

  // Persists a new order and it's respective records/logs on DB
  persist() {
    const order = this;

    return order.generateOrderRecords().then(() => order.save().then(newOrder => Promise.resolve(newOrder)));
  },

  handleProvidersErrors(errs) {
    const order = this;
  },
};

OrderSchema.plugin(idvalidator);
OrderSchema.plugin(deepPopulate);
OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', OrderSchema);

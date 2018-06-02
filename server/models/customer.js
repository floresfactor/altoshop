const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const uniqueValidator = require('mongoose-unique-validator');

const Conekta = require('conekta');

const { regexValidations } = '../lib/util';
const PaymentMethod = require('./paymentMethod');
const Discount = require('./discount');


const CartItemParentSchema = new Schema({
  type: {
    type: String,
    enum: ['productGroup'],
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: ['ProductGroup'],
  },
});

const CartItemSchema = new Schema({
  itemID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    min: 0,
    required: true,
  },
  type: {
    type: String,
    enum: ['product', 'package'],
    required: true,
  },
  parent: CartItemParentSchema,
});

const CustomerSchema = new Schema({
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
  genere: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'chose you genere'],
  },
  city: {
    type: String,
    required: [true, 'chose you city'],
  },
  state: {
    type: String,
    required: [true, 'chose you state'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  phone: {
    type: String,
    require: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
  },
  cartItems: [CartItemSchema],
  externalReference: {
    type: String,
  },
}, {
  timestamps: true,
});

CustomerSchema.methods = {
  // Registers the customer on the external API service (conekta)
  createExternal() {
    return new Promise((resolve, reject) => {
      Conekta.Customer.create({
        name: `${this.firstName} ${this.lastName}`,
        email: this.email,
      }, (err, extCustomer) => {
        if (err) {
          reject(err);
        } else {
          this.externalReference = extCustomer._id;
          this.save().then(savedCustomer => resolve(savedCustomer));
        }
      });
    });
  },

  // Creates and relates a new payment method for the customer
  addPaymentMethod(paymentMethod) {
    const pm = new PaymentMethod(paymentMethod);
    pm.customer = this.id;

    return pm.validate().then(() => new Promise((resolve, reject) => {
      Conekta.Customer.find(this.externalReference, (err, extCust) => {
        if (err) {
          reject(err);
        }

        extCust.createPaymentSource({
          type: 'card',
          token_id: paymentMethod.conektaToken,
        }, (err, extPaymentMethod) => {
          if (err) {
            reject(err);
          }

          pm.externalReference = extPaymentMethod.id;
          pm.brand = extPaymentMethod.brand;
          pm.save().then(savedPM => resolve(savedPM));
        });
      });
    }));
  },

  // Populates cart items with their related item
  // Returns a non-mongoose [object]
  populateCartItems() {
    const cartItems = this.cartItems.toObject();

    if (cartItems.some(i => i.type === 'package'))
        throw new Error('not implemented');

    // Get the parent of each cartItem
    const populatePGParents = new Promise((resolve, reject) => {
        const PGParentItems = cartItems.filter(i => !!i.parent && i.parent.type === 'productGroup');

        if (PGParentItems.length) {
            mongoose.model('ProductGroup').find({ _id: { $in: PGParentItems.map(item => item.parent.parent) } }).then(pgs => {
                PGParentItems.forEach(item => {
                    item.parent.parent = pgs.find(pg => pg.id == item.parent.parent);
                });

                // Return the product groups so we can check for a discount
                resolve(pgs);
            });
        } else {
            resolve();
        }
    });

    // Get the cart products
    return populatePGParents.then((prodGroups) => {
        // If there is a product group go and find the discount for that group
        if (prodGroups) {
            let productGroups = prodGroups;
            const discountPromises = productGroups.map(pg => pg.checkDiscount());

            return Promise.all(discountPromises).then(pgs => {
                // Replace any items in the cart with the product group discount 
                pgs.forEach(pg => {
                    pg._doc.products.forEach(p => {
                        cartItems.forEach(ci => {
                            if (ci.itemID.toString() === p._doc._id.toString())
                                ci.item = p._doc;
                        });
                    });
                });
                
                return mongoose.model('Product').find({ _id: { $in: cartItems.filter(i => i.type === 'product').map(i => i.itemID) } }).then(prods => {
                    //Discount.methods.checkDiscount(prods);
                    const prodIds = [];
                    let discountAmount = 0;

                    const productDiscountPromises = prods.map(p => p.checkDiscount());
                    return Promise.all(productDiscountPromises).then(discountedProds => {
                        cartItems.forEach(i => {
                            // Don't change if item already exists since that item has pg discount
                            if (!i.item)
                                i.item = discountedProds.find(p => p.id == i.itemID);
                        });
        
                        return cartItems;  
                    });
                });
            });
        } else {
            return mongoose.model('Product').find({ _id: { $in: cartItems.filter(i => i.type === 'product').map(i => i.itemID) } }).then(prods => {
                cartItems.forEach(i => {                            
                    i.item = prods.find(p => p.id == i.itemID);
                });

                return cartItems;  
            });
        }
    });
  }
};

CustomerSchema.plugin(uniqueValidator, {
  message: '{PATH} is already registered.',
});
CustomerSchema.plugin(idvalidator);
CustomerSchema.plugin(deepPopulate);

module.exports = mongoose.model('Customer', CustomerSchema);

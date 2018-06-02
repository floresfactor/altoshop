const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const mongoosePaginate = require('mongoose-paginate');

const DisplayItem = require('../models/displayItem');
const CategoryPath = require('../models/categoryPath');
const Discount = require('./discount');
const util = require('../lib/util');
const generateNativeValidationErrors = require('../lib/generateErrors').generateValidationNativeError;

const ProductSchema = new Schema({
  category: {
    // Refers to a documnet in CategoryPath.categoryID
    // Using Mixes schema type just to be able to populate this field
    // ref: 'CategoryPath.categoryID', <-- This is true, but not supported by mongoose
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator(val) {
        if (!this.isNew) { return true; }

        // Verify it's a valid ObjectID
        if (!(/^[a-f\d]{24}$/i.test(val))) { return false; }

        return true;
      },
      message: 'Invalid cast to ObjectID on category',
    },
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  images: [{
    name: {
      type: String,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
  }],
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  inventariable: {
    type: Boolean,
    required: true,
  },
  stock: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    default: () => mongoose.Types.ObjectId().toString(),
  },
  tags: [String],
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
  },
  updatedAt: {
    type: Date,
  },
});

// ****** ****** ****** ****** *****
// ****** Pre-save / Pre-update ****
// ****** ****** ****** ****** *****

const commonSaveLogic = (productCtx) => {
  productCtx.updatedAt = Date.now();
};

ProductSchema.pre('save', function (next) {
  next(commonSaveLogic(this));
});

ProductSchema.pre('update', function (next) {
  next(commonSaveLogic(this));
});

// ****** ****** ****** ****** *****
// ******     Pre-validate      ****
// ****** ****** ****** ****** *****

ProductSchema.pre('validate', function (next) {
  const doc = this;

  if (!doc.category) { next(generateNativeValidationErrors('validation error', [{ propertyName: 'category', message: 'This field is required' }])); } else {
    if (doc.isNew || doc.isModified('category')) {
      return CategoryPath.findOne({ categoryID: this.category }).then(category => {
        if (!category) { next(generateNativeValidationErrors('validation error', [{ propertyName: 'category', message: 'Category not found' }])); }

        next();
      });
    }
    next();
  }
});

// ****** ****** ****** ****** ***** ******
// ******       Post save/remove       ****
// ****** ****** ****** ****** ***** ******

// Upsert displayItem records
ProductSchema.post('save', (doc) => {
  // Verify that the product doesn't belong to any productGroup before upseting displayItems
  mongoose.model('ProductGroup').count({ products: doc._id }).then((count) => {
    if (count !== 0) { return Promise.resolve(); }

    // Upsert display item records
    return DisplayItem.findOneAndUpdate({ itemID: doc._id },
      {
        $set: {
          itemSku: doc.sku,
          category: doc.category,
          name: doc.name,
          itemType: 'product',
          enabled: true, // <- Todo
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      },
      {
        new: true,
        upsert: true,
      }).catch((errs) => {
      // Todo: Log this
      console.log(errs);
    });
  });

  if (doc.inventariable) {
    mongoose.model('Package').find({
      packageItems: { $elemMatch: { product: doc._id } },
    }).then(packages => {
      const product = doc;
      packages.forEach(_package => {
        const packageItem = _package.packageItems.find(packageItem => packageItem.product.equals(doc._id));

        if (!packageItem) {
          console.log("something wrong happened, packageItem wasn't found. look at pre save product.js.");
        } else {
          const isEnoughStock = _package.stock <= packageItem.quantity * product.stock;
          if (!isEnoughStock) {
            _package.stock = packageItem.quantity * product.stock;
            _package.enabled = _package.enabled && _package.stock > 0;
            _package.save();
          }
        }
      });
    });
  }
});

// Remove displayItem records
ProductSchema.post('remove', (doc) => {
  const postProductRemovePromises = [
    // Remove from displayItems
    DisplayItem.findOneAndRemove({ itemID: doc._id }),

    // Remove from product groups
    mongoose.model('ProductGroup').update({}, {
      $pullAll: { products: [doc._id] },
    }, { multi: true }),
  ];

  Promise.all(postProductRemovePromises).catch(errs => {
    // Todo: Log this
    console.log(errs);
  });
});

// ****** ****** ****** ****** *****
// ******        Statics        ****
// ****** ****** ****** ****** *****

ProductSchema.statics = {
  listPaginated(options) {
    const findQuery = options.filterBy || {};
    const currentPage = Number(options.currentPage) || 1;
    const pageSize = Number(options.pageSize) || 12;
    const sort = options.sortBy || { createdAt: -1 };

    return this.paginate(findQuery, { page: currentPage, limit: pageSize, sort });
  },
  // Validates a set of products not to be repeated, generates errors if they are
  // Todo: This is not used, will it be? Check the code before using (it's old)
  validateNonRepeatedProducts(products) {
    return new Promise((resolve, reject) => {
      // Validate there are no repeated products in product class
      const duplicatedProducts = util.getNonUniqueValues(products, 'name');

      // Return errors if there are repeated products
      if (duplicatedProducts.length > 0) {
        const errors = { errors: {} };

        // Todo: Map errors with generic functions for it (this is old code)
        products.filter(v => duplicatedProducts.indexOf(v.name) != -1)
          .map((v, i) => `products[${i}].name`)
          .forEach(errorProp => errors.errors[errorProp] = { message: 'Repeated product', name: 'ValidationError' });

        reject(errors);
      } else {
        resolve();
      }
    });
  },

  removeFromDisplayItems(productIDsArr) {
    if (!productIDsArr || !Array.isArray(productIDsArr)) { return Promise.reject(); }

    return mongoose.model('DisplayItem').remove({ itemID: { $in: productIDsArr } }).then(() => Promise.resolve());
  },

  addToDisplayItems(productIDsArr) {
    if (!productIDsArr || !Array.isArray(productIDsArr)) { return Promise.reject(); }

    return Promise.all(productIDsArr.map(prodID => new Promise((resolve, reject) => this.findOne({ _id: prodID }).then(doc => {
      if (!doc) { return reject('Not found'); }

      // Trigger post save to remove from display items
      return doc.save().then(() => resolve());
    }))));
  },
};

// ****** ****** ****** ****** *****
// ******        Methods        ****
// ****** ****** ****** ****** *****

ProductSchema.methods = {
  populateFields(populateFieldsArr, options) {
    return this.deepPopulate(populateFieldsArr || [], options || null);
  },
  // Categories are nested objects inside themselves, we need this method to find the product category
  populateCategory(includeSubCategories = true) {
    const product = this;

    // Find category record
    return CategoryPath.findOne({ categoryID: product.category }).then(categoryRecord => {
      if (!categoryRecord) { return Promise.resolve(); }

      // Get the actual category object
      return mongoose.model('RecursiveCategory').findCategoryByPath(categoryRecord.path, categoryRecord.categoryID).then(category => {
        if (!category) { return Promise.resolve(); }

        if (!includeSubCategories) { category = Object.assign({}, category.toObject(), { subCategories: [] }); }

        product.category = category;
        return Promise.resolve();
      });
    });
  },

  // Check for discount of product array
  checkDiscount() {
    let doc = this;
    let discountAmount = 0;

    if (doc.item) { return Promise.resolve(); }

    return mongoose.model('Product').findById(doc._id).then(product => mongoose.model('Discount').findOne({ 'items.itemId': doc._id }).then(dcount => {
      if (dcount) { discountAmount = dcount.amount; }

      product._doc.originalPrice = product.price;
      product._doc.price = product.price - ((discountAmount / 100) * product.price);
      if ((discountAmount > 0) && dcount.enabled) { product._doc.discounted = true; }

      doc = product;
      return Promise.resolve(doc);
    }));
  },
};

// ****** ****** ****** ****** *****
// ******   Plugins & Export    ****
// ****** ****** ****** ****** *****

ProductSchema.plugin(deepPopulate);
ProductSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Product', ProductSchema);

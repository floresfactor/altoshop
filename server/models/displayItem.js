const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const random = require('mongoose-simple-random');

const Discount = require('./discount');

const DisplayItemSchema = new Schema({
  itemID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  itemSku: {
    type: String,
    required: true,
    unique: true,
  },
  item: {
    type: Schema.Types.Mixed,
    validate: {
      validator(v) {
        return !v;
      },
      message: 'item is a populate-only property, not supposed to be persisted',
    },
  },
  category: {
    // Refers to a documnet in CategoryPath.categoryID
    // Using Mixes schema type just to be able to populate this field
    // ref: 'CategoryPath.categoryID', <-- This is true, but not supported by mongoose
    type: Schema.Types.Mixed,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  itemType: {
    type: String,
    enum: ['product', 'productGroup'],
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  tags: [String],
    counterView: {
        type: Number,
        default: 0
    }
});

// ****** ****** ****** ****** *****
// ******        Virtuals       ****
// ****** ****** ****** ****** *****

// ****** ****** ****** ****** *****
// ****** Pre-save / Pre-update ****
// ****** ****** ****** ****** *****

// ****** ****** ****** ****** *****
// ******     Pre-validate      ****
// ****** ****** ****** ****** *****

// ****** ****** ****** ****** *****
// ******        Statics        ****
// ****** ****** ****** ****** *****

DisplayItemSchema.statics = {
  listPaginated(options) {
    const constQuery = {
      enabled: true,
    };

    const findQuery = options.filterBy ? Object.assign({}, options.filterBy, constQuery) : constQuery;
    const currentPage = Number(options.currentPage) || 1;
    const pageSize = Number(options.pageSize) || 12;
    const sort = options.sortBy || { createdAt: -1 };

    return this.paginate(findQuery, { page: currentPage, limit: pageSize, sort });
  },

  listPaginatedOverDocumentArray(displayItemsArr, options) {
    const constQuery = {
      enabled: true,
    };

    const findQuery = options.filterBy ? Object.assign({}, options.filterBy, constQuery) : constQuery;
    const currentPage = Number(options.currentPage) || 1;
    const pageSize = Number(options.pageSize) || 12;
    const sort = options.sortBy || { createdAt: -1 };

    return this.paginate(Object.assign(findQuery, { _id: { $in: displayItemsArr.map(dp => dp.id) } }),
      { page: currentPage, limit: pageSize, sort });
  },

  // Get products under the current category and its subcategories
  getNestedCategoryDocsRecursiveAsync(category, first) {
    return new Promise((resolve) => {
      const initialProdsPromise = new Promise((resolve) => {
        if (first) {
          this.find({ category: { $eq: category._id } }).then(docs => resolve(docs));
        } else {
          return resolve([]);
        }
      });

      return initialProdsPromise.then(initialProds => {
        const recursionPromises = category.subCategories.map(sc => new Promise((resolve) => {
          this.find({ category: { $eq: sc._id } }).then(scDisplayProds => {
            this.getNestedCategoryDocsRecursiveAsync(sc, false).then((nestedDisplayProds) => resolve([...scDisplayProds, ...nestedDisplayProds]));
          });
        }));

        return Promise.all(recursionPromises).then(allNestedProducts => {
          resolve(initialProds.concat(...allNestedProducts));
        });
      });
    });
  },

  findDescendantsOfCategory(category) {
    return this.getNestedCategoryDocsRecursiveAsync(category, true);
  },
};

// ****** ****** ****** ****** *****
// ******        Methods        ****
// ****** ****** ****** ****** *****

DisplayItemSchema.methods = {
  populateItem() {
    const doc = this;

    if (doc.itemType === 'product') {
      return doc.populateProductItem();
    } // productGroup
    return doc.populateProductGroupItem();
  },

  populateProductItem() {
    const doc = this;
    let discountAmount = 0;

    return mongoose.model('Product').findById(doc.itemID).then(product => mongoose.model('Discount').findOne({ 'items.itemId': doc.itemID }).then(dcount => {
      if (dcount) { discountAmount = dcount.amount; }

      product._doc.originalPrice = product.price;
      product._doc.price = product.price - ((discountAmount / 100) * product.price);
      if ((discountAmount > 0) && dcount.enabled) { product._doc.discounted = true; }

      doc.item = product;
      return Promise.resolve();
    }));
  },

  populateProductGroupItem() {
    const doc = this;
    let discountAmount = 0;

    return mongoose.model('ProductGroup').findById(doc.itemID).then(pg => mongoose.model('Discount').findOne({ 'items.itemId': doc.itemID }).then(dcount => {
      if (dcount) { discountAmount = dcount.amount; }

      return pg.populateFields(['products']).then(() => {
        pg.products.forEach(prod => {
          prod._doc.originalPrice = prod.price;
          prod._doc.price = prod.price - ((discountAmount / 100) * prod.price);
          if ((discountAmount > 0) && dcount.enabled) { prod._doc.discounted = true; }
        });
        doc.item = pg;
        return Promise.resolve();
      });
    }));
  },

  // Categories are nested objects inside themselves, we need this method to find the product category
  populateCategory(includeSubCategories = true) {
    const displayItem = this;

    // Find category record
    return mongoose.model('CategoryPath').findOne({ categoryID: displayItem.category }).then(categoryRecord => {
      if (!categoryRecord) { return Promise.resolve(); }

      // Get the actual category object
      return mongoose.model('RecursiveCategory').findCategoryByPath(categoryRecord.path, categoryRecord.categoryID).then(category => {
        if (!category) { return Promise.resolve(); }

        if (!includeSubCategories) { category = Object.assign({}, category.toObject(), { subCategories: [] }); }

        displayItem.category = category;
        return Promise.resolve();
      });
    });
  },
};

// ****** ****** ****** ****** *****
// ******   Plugins & Export    ****
// ****** ****** ****** ****** *****
DisplayItemSchema.plugin(deepPopulate);
DisplayItemSchema.plugin(mongoosePaginate);
DisplayItemSchema.plugin(random, { path: 'r' });

const DisplayItemModel = mongoose.model('DisplayItem', DisplayItemSchema);

module.exports = DisplayItemModel;

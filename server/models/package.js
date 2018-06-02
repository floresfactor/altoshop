const mongoose = require('mongoose');
const patcher = require('jsondiffpatch').create();
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');
const newValErrs = require('../lib/generateErrors').generateValidationErrors;
const newNotFndErr = require('../lib/generateErrors').generateNotFoundError;
const newCustErr = require('../lib/generateErrors').generateCustomError;
const fs = require('fs');
const path = require('path');
const folderSettings = require('../settings').folderSettings;
const getNonUniqueValues = require('../lib/util').getNonUniqueValues;
const moment = require('moment');

const PackageItem = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    min: 1,
    required: true,
  },
});

const Image = new Schema({
  name: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
});

const PackageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: false,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: Image,
  },
  price: {
    type: Number,
    // validate: {
    //     validator: function (price) {
    //         return price > 0;
    //     },
    //     message: 'Price must be greater than 0'
    // },
    min: 0,
    required: true,
  },
  stock: {
    type: Number,
    min: 0,
    required: true,
  },
  expirationDate: {
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
  updatedAt: {
    type: Date,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    default: () => mongoose.Types.ObjectId().toString(),
  },
  packageItems: {
    type: [PackageItem],
  },
});

const commonSaveLogic = packageCtx => {
  packageCtx.updatedAt = Date.now();
};

PackageSchema.pre('save', function (next) {
  const doc = this;

  return doc.setStock().then(() =>
    doc
      .canStayEnabled()
      .catch(errs => {
        doc.enabled = false;
      })
      .then(() => {
        next(commonSaveLogic(doc));
      })
  );
});

PackageSchema.pre('update', function (next) {
  next(commonSaveLogic(this));
});

PackageSchema.statics = {
  listPaginated(options, popOpts) {
    const findQuery = options.filterBy || {};
    const currentPage = Number(options.currentPage) || 1;
    const pageSize = Number(options.pageSize) || 12;
    const sort = options.sortBy || { createdAt: -1 };

    return this.paginate(findQuery, {
      page: currentPage,
      limit: pageSize,
      sort,
      populate: popOpts,
    });
  },
  // Don't allow 2+ packages with same name
  validateNonRepeatedPackages(packag) {
    return this.find({ name: packag.name }).then(
      docs =>
        (docs.length > 0
          ? Promise.reject(
            newValErrs([
              {
                message: 'A package with the same name already exists',
                propertyName: 'name',
              },
            ])
          )
          : Promise.resolve())
    );
  },

  getOnePopulated(id, popOpts) {
    return this.findOne({ _id: id })
      .deepPopulate(popOpts)
      .exec()
      .then(doc => doc || Promise.reject(newNotFndErr('Package not found')));
  },
  // Validation & save Process
  validateAndSave(packag) {
    delete packag.image, packag.packageItems;
    const packageDoc = new this(packag);

    return packageDoc
      .validate()
      .then(() =>
        // "unhandled statusless" error ( should has status 400)
        this.validateNonRepeatedPackages(packag)
      )
      .then(() => packageDoc.save())
      .then(doc => doc.getWithItems());
  },
  // Validate & patch
  findAndPatch(id, patch) {
    return this.findOne({ _id: id }).then(
      doc =>
        (doc
          ? doc.applyPatch(patch)
          : Promise.reject(newNotFndErr('Package not found')))
    );
  },

  addItems(id, packageItems) {
    return this.findById(id).then(doc => {
      if (!doc) return Promise.reject(newNotFndErr('Package not found'));

      const newPackageItems = [...doc.packageItems, ...packageItems];

      const repeatedItems = getNonUniqueValues(newPackageItems, 'product');

      if (repeatedItems.length > 0) {
        const err = {
          errors: {
            productItems: {
              message: 'Repeated Product',
              name: 'ValidationError',
              repeatedProducts: [],
            },
          },
          status: 400,
        };
        repeatedItems.map(item => {
          err.errors.productItems.repeatedProducts.push(item);
        });
        return Promise.reject(err);
      }
      doc.packageItems = newPackageItems;
      return doc
        .save()
        .then(savedDoc => savedDoc.deepPopulate('packageItems.product'));
    });
  },

  putPackageItem(packageID, packageItem) {
    return this.findById(packageID).then(doc => {
      if (!doc) return Promise.reject(newNotFndErr('Package not found'));

      const theItem = doc.packageItems.find(
        item => item.product.toString() == packageItem.product
      );

      if (!theItem) return Promise.reject(newNotFndErr('Product not found'));

      doc.packageItems.pull(theItem.id);
      doc.packageItems.push(packageItem);

      return doc
        .save()
        .then(svdDoc => svdDoc.deepPopulate('packageItems.product'));
    });
  },
};

PackageSchema.methods = {
  populateFields(fieldsArr) {
    return this.deepPopulate(fieldsArr || []);
  },
  // Populates a package with its items
  getWithItems() {
    return this.deepPopulate('packageItems.product');
  },
  // Applies a patch over a package
  applyPatch(patch) {
    const doc = this;
    validateChanges = new Promise((resolve, reject) => {
      if (patch.enabled && patch.enabled[1]) {
        doc
          .canStayEnabled()
          .then(() => {
            resolve();
          })
          .catch(errs => {
            reject(errs);
          });
      } else {
        resolve();
      }
    });

    return validateChanges
      .then(() => {
        // Don't allow this modifications through patch
        delete patch.image,
        patch.packageItems,
        patch.createdAt,
        patch.updatedAt,
        patch.sku;

        const originalName = doc.name;

        try {
          patcher.patch(doc, patch);
        } catch (err) {
          // Todo: Leaking error stack to client
          return Promise.reject(err);
        }

        return originalName === doc.name
          ? doc.save().then(doc => doc.getWithItems())
          : doc.constructor
            .validateNonRepeatedPackages(doc)
            .then(() => doc.save())
            .then(doc => doc.getWithItems());
      })
      .catch(err => Promise.reject(err));
  },
  canStayEnabled() {
    const doc = this;
    return new Promise((resolve, reject) => {
      const errs = [];

      doc.stock < 1 &&
        errs.push({ propertyName: 'stock', message: 'Package out of Stock.' });
      doc.packageItems.length < 1 &&
        errs.push({
          propertyName: 'packageItems',
          message: 'No products found in this package.',
        });
      doc.isExpired() &&
        errs.push({
          propertyName: 'expirationDate',
          message: 'Package expired.',
        });

      doc.hasEnoughProductsStock().then(outOfStockItem => {
        !!outOfStockItem &&
          errs.push({
            propertyName: `packageItems.$.${doc.packageItems.indexOf(
              outOfStockItem
            )}`,
            message: 'Product out of Stock.',
          });
        if (errs.length) return reject(newValErrs(errs)); // Todo: check the correct status and type error

        return resolve();
      });
    });
  },
  isExpired() {
    const startOfToday = moment().startOf('day');
    const startOfExpDate = moment(this.expirationDate).startOf('day');

    return moment(startOfExpDate).isBefore(startOfToday);
  },
  hasEnoughProductsStock() {
    const doc = this;

    return doc.deepPopulate('packageItems.product').then(() => {
      const outOfStockItem = doc.packageItems.find(
        item => item.product.inventariable && item.quantity > item.product.stock
      );

      return Promise.resolve(outOfStockItem);
    });
  },
  setStock() {
    const doc = this;

    return doc.deepPopulate('packageItems.product').then(() => {
      let stock = doc.stock;
      for (const item of doc.packageItems) {
        if (!stock) break; // stock == 0 break and go directly to set the stock at 0;
        if (item.product.inventariable) {
          // is item inventariable? go test stock
          if (item.quantity * stock >= item.product.stock) {
            // insuficent stock? lets calculate the max posible stock
            stock = Math.trunc(item.product.stock / item.quantity);
          }
        }
      }
      doc.stock = stock;
      return Promise.resolve();
    });
  },
  setImage(imageFile) {
    const doc = this;

    return new Promise((resolve, reject) => {
      const imgPath = `${imageFile.destination}/`;
      const originalName = imageFile.originalname;
      const originalImgFullPath = imgPath + originalName;
      const ext = path.extname(originalName);

      const oldImgName = doc.image ? path.basename(doc.image.src) : null;

      if (oldImgName && oldImgName.trim()) {
        // delete from server the old image if it exists
        fs.unlink(imgPath + oldImgName, err => {
          console.log(err);
        });
      }
      doc.image = {};
      doc.image._id = mongoose.Types.ObjectId();
      const newImgName = doc.image._id + ext;
      const serverNewImgName = imgPath + newImgName;

      fs.rename(originalImgFullPath, serverNewImgName, err => {
        // this must be in the multer middleware
        if (err) {
          console.log(err);
          reject(err);
          fs.unlink(originalImgFullPath, err => {
            console.log(err);
          });
        } else {
          doc.image.name = originalName;
          doc.image.src =
            folderSettings.PUBLIC_ADMIN_IMAGES_FOLDER + newImgName;

          doc
            .save()
            .then(doc => {
              resolve(doc.image);
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    });
  },
};

PackageSchema.plugin(idvalidator);
PackageSchema.plugin(deepPopulate);
PackageSchema.plugin(mongoosePaginate);

// This will make the packages collection available
// globally using 'const packages = mongoose.model('packages');'
module.exports = mongoose.model('Package', PackageSchema);

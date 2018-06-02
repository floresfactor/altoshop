const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const patcher = require('jsondiffpatch').create();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ProductGroup = require('../models/productGroup');
const ValidationErrsGen = require('../lib/generateErrors').generateValidationErrors;
const folderSettings = require('../settings').folderSettings;
const auth = require('../config/auth/strategies/basic');
// ************
// ** Admin  **
// ************

// Gets all productGroup's
// Populates productGroup's.products AND productGroup's.category (without subCategories)
router.get('/api/admin/productGroups', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const options = req.query;

  // Build complex $and filter query that might be needed for name_or_sku property (which is an $or itself)
  if (options.filterBy && Object.keys(options.filterBy).length) {
    options.filterBy.$and = [];

    // Filtering by name $or sku
    if (typeof options.filterBy.name_or_sku === 'string' && options.filterBy.name_or_sku.length >= 3) {
      const $or = [];
      $or.push({ name: new RegExp(options.filterBy.name_or_sku, 'i') });
      $or.push({ sku: options.filterBy.name_or_sku });
      options.filterBy.$and.push({ $or });
      delete options.filterBy.name_or_sku;
    }

    // Filtering by category
    // as Product.category has a MIXED schema, we need to cast categoryID to ObjectId(categoryId) manually
    if (typeof options.filterBy.category === 'string' && mongoose.Types.ObjectId.isValid(options.filterBy.category)) {
      options.filterBy.$and.push({ category: new mongoose.Types.ObjectId(options.filterBy.category) });
      delete options.filterBy.category;
    }

        // Transfer every other property into the $and
        for (let key in options.filterBy) {
            if (key == '$and')
                continue;
            let o = { [key]: options.filterBy[key] }
            options.filterBy.$and.push(o);
            delete options.filterBy[key];
        
    }
  }

  // // Filtering by name? Get a case insensitive regex for it
  // if (options.filterBy && typeof options.filterBy.name === 'string' && options.filterBy.name.length >= 3)
  //     options.filterBy.name = new RegExp(options.filterBy.name, 'i');

  // // Filtering by category?
  // // as Product.category has a MIXED schema, we need to cast categoryID to ObjectId(categoryId) manually
  // if (options.filterBy && typeof options.filterBy.category === 'string' && mongoose.Types.ObjectId.isValid(options.filterBy.category))
  //     options.filterBy.category = new mongoose.Types.ObjectId(options.filterBy.category);

  return ProductGroup.listPaginated(options || {}).then(pagination => {
    const productGroups = pagination.docs;
    const total = pagination.total;

    // Include categories on full listed
    const populatePromises = [
      ...productGroups.map(pg => pg.populateCategory(false)),
      ...productGroups.map(pg => pg.populateFields(['products'])),
    ];

    return Promise.all(populatePromises).then(() => res.send({ results: productGroups, count: total }));
  }).catch(errs => {
    next(errs);
  });
});

// Gets a productGroup by ID
// Populates productGroup's.products AND productGroup's.category (without subCategories)
router.get('/api/admin/productGroups/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }

  return ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    return prodGroup.populateCategory(false).then(() => prodGroup.populateFields(['products']).then(() => {
      const populateProductsCategories = prodGroup.products.map(prod => new Promise((resolve) => {
        prod.populateCategory(false).then(() => resolve());
      }));

      return Promise.all(populateProductsCategories).then(() => res.send(prodGroup));
    }));
  }).catch(errs => {
    next(errs);
  });
});

// Creates a productGroup
router.post('/api/admin/productGroups', auth.authJwt, auth.adminRequire, (req, res, next) => {
  let { productGroup } = req.body;

  if (!productGroup) { return res.status(400).send('No productGroup received'); }

  productGroup = new ProductGroup(productGroup);

  // Need to specifically cast to ObjectId because of product.category MIXED type (see notes at schema definition)
  if (productGroup.category) {
    productGroup.category = mongoose.Types.ObjectId(productGroup.category);
  }

  // All validations perfomed on mongoose middlewares & model
  // Todo:
  // Validate repeated productGroup.name ???
  return productGroup.save().then(newProductGroup => newProductGroup.populateCategory(false).then(() => newProductGroup.populateFields(['products']).then(() => res.send(newProductGroup)))).catch(errs => {
    next(errs);
  });
});

// Modifies the allowed properties of a productGroup
router.patch('/api/admin/productGroups/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { patch } = req.body;

  if (!req.params.id) { return res.status(400).send('No ID received'); }

  if (!patch) { return res.status(400).send('No Patch received'); }

  return ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    // Get modified product
    const patchedProd = patcher.patch(prodGroup.toObject(), patch);

    // Allow to patch only certain product properties
    if (patchedProd.name != prodGroup.name) { prodGroup.name = patchedProd.name; }
    if (patchedProd.description != prodGroup.description) { prodGroup.description = patchedProd.description; }
    if (patchedProd.enabled != prodGroup.enabled) { prodGroup.enabled = patchedProd.enabled; }
    if (patchedProd.sku != prodGroup.sku) { prodGroup.sku = patchedProd.sku; }

    // Anything changed?
    if (prodGroup.isModified()) {
      return prodGroup.save().then(prodGP => prodGP.populateCategory(false).then(() => prodGP.populateFields(['products']).then(() => res.send(prodGP))));
    }
    return prodGroup.populateCategory(false).then(() => prodGroup.populateFields(['products']).then(() => res.send(prodGroup)));
  }).catch(errs => {
    // is this an sku-unique error?
    if (errs.code === 11000) {
      next({
        errors: [{
          message: 'Duplicated sku or unique index error',
          name: 'sku',
        }],
      });
    } else { next(errs); }
  });
});

// Deletes a productGroup and triggers its products to display in client/main as single products again
router.delete('/api/admin/productGroups/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }

  ProductGroup.findByIdAndRemove(req.params.id).then(removedProdGP => {
    if (!removedProdGP) { return res.status(404).send('No found'); }

    const removeImgFilePromise = new Promise(resolve => {
      if (!removedProdGP.image || !removedProdGP.image.src) {
        return resolve();
      }
      const imgFileName = path.basename(removedProdGP.image.src);

      if (!imgFileName.trim()) { return resolve(); }

      fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (err) =>
        // We don't really care here if there was an error removing the file
        // TODO: Log this possible error
        resolve()
      );
    });

    // Call removedProd.remove()
    // Just to trigger mongoose middleware
    // (See https://github.com/Automattic/mongoose/issues/1241)
    return Promise.all([removedProdGP.remove(), removeImgFilePromise]).then(() => res.status(202).send());
  }).catch(errs => {
    next(errs);
  });
});

// Assigns a category to a productGroup
router.post('/api/admin/productGroups/:id/category', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { category } = req.body;

  if (!req.params.id) { return res.status(400).send('No ID received'); }

  if (!category) { return res.status(400).send('No Patch received'); }

  ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    const newProductGroupCategory = typeof category === 'string' ?
      category : typeof category === 'object' ? category._id : null;

    // Need to specifically cast to ObjectId because of product.category MIXED type (see notes at schema definition)
    prodGroup.category = mongoose.Types.ObjectId(newProductGroupCategory);

    // Actual category value is validated on mongoose middlewares (see model code)
    return prodGroup.save().then(prodGP => prodGP.populateCategory(false).then(() => prodGP.populateFields(['products']).then(() => res.send(prodGP))));
  }).catch(errs => {
    next(errs);
  });
});

// Adds or modifies a productGroup image
router.post('/api/admin/productGroups/:id/image', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }

  return ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    // Configure middleware to upload file to disk
    const storageOpts = multer.diskStorage({
      destination(req, file, cb) {
        cb(null, path.resolve(__dirname, folderSettings.SERVER_ADMIN_IMAGES_FOLDER));
      },
      filename(req, file, cb) {
        // Validate file extension
        if (!/\.(jpg|jpeg|png|gif)$/.test(file.originalname) || !file.mimetype.indexOf('image') == 0) {
          cb(ValidationErrsGen([{ message: 'only image files are allowed', propertyName: 'image' }]));
        } else {
          // Generate a unique file name for this shit
          let timeStamp = Date.now().toString();
          timeStamp = timeStamp.substring(timeStamp.length - 6);
          const fileName = (req.params && req.params.id) ?
            `${req.params.id}-${timeStamp}${path.extname(file.originalname)}` : file.originalname;

          cb(null, fileName);
        }
      },
    });

    // Promisify multer-middleware and run it
    return new Promise((resolve, reject) => {
      // Run middleware
      multer({ storage: storageOpts }).single('image')(req, res, (err) => (err ? reject(err) : resolve()));
    }).then(() => {
      const imgFile = req.file;

      if (!imgFile) { return Promise.reject('Unknown error'); }

      prodGroup.image = {
        name: imgFile.originalname,
        src: folderSettings.PUBLIC_ADMIN_IMAGES_FOLDER + imgFile.filename,
      };

      return prodGroup.save().then(() => res.send(prodGroup.image));
    });
  }).catch(errs => {
    next(errs);
  });
});

// Deletes a productGroup image
router.delete('/api/admin/productGroups/:id/image', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No productGroupID received'); }

  return ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    const img = prodGroup.image;

    if (!img) { return res.status(404).send('Image not found in productGroup'); }

    const imgFileName = path.basename(img.src);

    // Update the product removing the image
    return ProductGroup.findByIdAndUpdate(req.params.id, {
      $set: { image: null },
    }, { new: true }).then(() =>
      // Product was updated, delete image from server
      new Promise(resolve => {
        if (!imgFileName.trim()) { return resolve(); }

        fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (err) =>
          // We don't really care here if there was an error removing the file
          // TODO: Log this possible error
          resolve()
        );
      }).then(() => res.status(204).send())
    );
  }).catch(errs => {
    next(errs);
  });
});

// Adds a product/products to a productGroup
// Also removes the added products from displayItems for them no to show as 'stanging alone' items but to show only @productGroup
router.post('/api/admin/productGroups/:id/products', auth.authJwt, auth.adminRequire, (req, res, next) => {
  let { products } = req.body;

  if (!req.params.id) { return res.status(400).send('No productGroupID received'); }

  if (!products) { return res.status(400).send('No products received'); }

  if (!Array.isArray(products) && typeof products === 'string') { products = [products]; } else if (!Array.isArray(products)) { return res.status(400).send('Products must be of arrayOf(string) or string type'); }

  return ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    // Add to set doesn't work with ObjectID ?? It's adding repeated products
    // We avoid that with this loop
    products.forEach(prod => {
      if (!prodGroup.products.find(pObjectID => pObjectID.toString() == prod)) { prodGroup.products.addToSet(prod); }
    });

    return prodGroup.save().then(() =>
      // Remove products from displayItems first
      mongoose.model('Product').removeFromDisplayItems(products).then(() => prodGroup.populateFields(['products']).then(() => {
        const populateProductsCategories = prodGroup.products.map(prod => new Promise((resolve) => {
          prod.populateCategory(false).then(() => resolve());
        }));

        return Promise.all(populateProductsCategories).then(() => res.send(prodGroup.products));
      }))
    );
  }).catch(errs => {
    next(errs);
  });
});

// Deletes a product/products from a productGroup
// Also restores the product(s) displayItems for them to show again on main/client grid
router.delete('/api/admin/productGroups/:id/products', auth.authJwt, auth.adminRequire, (req, res, next) => {
  let { products } = req.query;

  if (!req.params.id) { return res.status(400).send('No productGroupID received'); }

  if (!products) { return res.status(400).send('No products received'); }

  if (!Array.isArray(products) && typeof products === 'string') { products = [products]; } else if (!Array.isArray(products)) { return res.status(400).send('Products must be of arrayOf(string) or string type'); }

  return ProductGroup.findById(req.params.id).then(prodGroup => {
    if (!prodGroup) { return res.status(404).send('No found'); }

    // Adds values to the array if not already present
    prodGroup.products.remove(...products);

    // Disable productGroup if it has no products anymore
    prodGroup.enabled = prodGroup.products.length > 0;

    return prodGroup.save().then(() =>
      // Add products to display items again
      mongoose.model('Product').addToDisplayItems(products).then(() => prodGroup.populateFields(['products']).then(() => {
        const populateProductsCategories = prodGroup.products.map(prod => new Promise((resolve) => {
          prod.populateCategory(false).then(() => resolve());
        }));

        return Promise.all(populateProductsCategories).then(() => res.send(prodGroup.products));
      }))
    );
  }).catch(errs => {
    next(errs);
  });
});

router.get('/api/admin/productGroupsTags',auth.authJwt, auth.adminRequire, (req, res, next)=>{
    const query = req.query;
    if(!query.search)
        return res.status(400).send("Not search query received");
    const search = new RegExp('^' + query.search + '$','i');
    ProductGroup.aggregate([ 
        { "$match": {"tags": { "$regex": query.search, "$options": "i" }}},
        { "$match": { "enabled": true }},
        { "$unwind": "$tags"},
        { "$match": {"tags": { "$regex": query.search, "$options": "i" }}},
        { "$group": { "_id": null, "tags": {"$addToSet": "$tags"}}},
        { "$unwind": "$tags"},
        { "$project": {
            "_id": 0,
            "tags": 1
        }}
    ]).then( docs =>{
            return res.send({tags: docs});
        }).catch( error =>{
            next(error);
        })
});
// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

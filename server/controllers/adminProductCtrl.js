const express = require('express');

const router = express.Router();
const lorem = require('lorem-ipsum');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const patcher = require('jsondiffpatch').create();

const ValidationErrsGen = require('../lib/generateErrors').generateValidationErrors;
const folderSettings = require('../settings').folderSettings;
const Product = require('../models/product');
const CategoryPath = require('../models/categoryPath');
const auth = require('../config/auth/strategies/basic');

router.get('/api/admin/products', auth.authJwt, auth.adminRequire, (req, res, next) => {
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
    for (const key in options.filterBy) {
      if (key == '$and') { continue; }

      options.filterBy.$and.push({ key: options.filterBy[key] });
      delete options.filterBy[key];
    }
  }

  return Product.listPaginated(options || {}).then(pagination => {
    const products = pagination.docs;
    const total = pagination.total;

    // Include categories on full listed
    const populatePromises = products.map(p => p.populateCategory());
    return Promise.all(populatePromises).then(() => res.send({ results: products, count: total }));
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/admin/products', auth.authJwt, auth.adminRequire, (req, res, next) => {
  let { product } = req.body;

  if (!product) { return res.status(400).send('No product received'); }

  product = new Product(product);

  // Need to specifically cast to ObjectId because of product.category MIXED type (see notes at schema definition)
  if (product.category) {
    product.category = mongoose.Types.ObjectId(product.category);
  }

  // All validations perfomed on mongoose middlewares & model
  // Todo:
  // Validate repeated product.name ???
  return product.save().then(newProduct => newProduct.populateCategory().then(() => res.send(newProduct))).catch(errs => {
    next(errs);
  });
});

router.patch('/api/admin/products/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { patch } = req.body;

  if (!req.params.id) { return res.status(400).send('No ID received'); }

  if (!patch) { return res.status(400).send('No Patch received'); }

  Product.findById(req.params.id).then(prod => {
    if (!prod) { return res.status(404).send('No found'); }

    // Get modified product
    const patchedProd = patcher.patch(prod.toObject(), patch);

    // Allow to patch only certain product properties
    if (patchedProd.name != prod.name) { prod.name = patchedProd.name; }
    if (patchedProd.description != prod.description) { prod.description = patchedProd.description; }
    if (patchedProd.price != prod.price) { prod.price = patchedProd.price; }
    if (patchedProd.stock != prod.stock) { prod.stock = patchedProd.stock; }
    if (patchedProd.inventariable != prod.inventariable) {
      prod.inventariable = patchedProd.inventariable;
      if (!prod.inventariable) { prod.stock = 0; }
    }
    if (patchedProd.sku != prod.sku) { prod.sku = patchedProd.sku; }

    // Anything changed?
    if (prod.isModified()) {
      return prod.save().then(prod => prod.populateCategory().then(() => res.send(prod)));
    }
    return prod.populateCategory().then(() => res.send(prod));
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

router.delete('/api/admin/products/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }

  Product.findByIdAndRemove(req.params.id).then(removedProd => {
    if (!removedProd) { return res.status(404).send('No found'); }

    const removeImgFilesPromises = removedProd.images.map(img => new Promise(resolve => {
      const imgFileName = path.basename(img.src);

      if (!imgFileName.trim()) { return resolve(); }

      fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (err) =>
        // We don't really care here if there was an error removing the file
        // TODO: Log this possible error
        resolve()
      );
    }));

    // Call removedProd.remove()
    // Just to trigger mongoose middleware
    // (See https://github.com/Automattic/mongoose/issues/1241)
    return Promise.all([removedProd.remove(), removeImgFilesPromises]).then(() => res.status(202).send());
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/admin/products/:id/category', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { category } = req.body;

  if (!req.params.id) { return res.status(400).send('No ID received'); }

  if (!category) { return res.status(400).send('No Patch received'); }

  Product.findById(req.params.id).then(prod => {
    if (!prod) { return res.status(404).send('No found'); }

    const newProductCategory = typeof category === 'string' ?
      category : typeof category === 'object' ? category._id : null;

    // Need to specifically cast to ObjectId because of product.category MIXED type (see notes at schema definition)
    prod.category = mongoose.Types.ObjectId(newProductCategory);

    // Actual category value is validated on mongoose middlewares (see model code)
    return prod.save().then(prod => {
      prod.populateCategory().then(() => res.send(prod));
    });
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/admin/products/:id/images', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }

  return Product.findById(req.params.id).then(prod => {
    if (!prod) { return res.status(404).send('No found'); }

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

      prod.images.push({
        name: imgFile.originalname,
        src: folderSettings.PUBLIC_ADMIN_IMAGES_FOLDER + imgFile.filename,
      });

      return prod.save().then(() => res.send(prod.images));
    });
  }).catch(errs => {
    next(errs);
  });
});

router.delete('/api/admin/products/:id/images/:imageID', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id || !req.params.imageID) { return res.status(400).send(`No ${req.params.id ? 'imageID' : 'productID'} received`); }

  return Product.findById(req.params.id).then(prod => {
    if (!prod) { return res.status(404).send('No found'); }

    const img = prod.images.find(i => i._id == req.params.imageID);

    if (!img) { return res.status(404).send('Image not found in product'); }

    const imgFileName = path.basename(img.src);

    // Update the product removing the image and returning the new (updated) doc
    return Product.findByIdAndUpdate(req.params.id, {
      $pull: { images: { _id: req.params.imageID } },
    }, { new: true }).then(prod =>
      // Product was updated, delete image from server
      new Promise(resolve => {
        if (!imgFileName.trim()) { return resolve(); }

        fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (err) =>
          // We don't really care here if there was an error removing the file
          // TODO: Log this possible error
          resolve()
        );
      }).then(() => res.send(prod.images))
    );
  }).catch(errs => {
    next(errs);
  });
});

// Todo: Remove thi shit
router.get('/api/addTestProducts', (req, res, next) => {
  const promiseArr = [];
  const imagesArr = [
    'http://localhost:3005/img/500.png',
    'http://localhost:3005/img/595bca2892e9b54bef7c52c0.jpg',
    'http://localhost:3005/img/595bc660228fab4b04ee51c0.jpeg',
    'http://localhost:3005/img/monitor.jpeg',
    'http://localhost:3005/img/luna.jpg',
    'http://localhost:3005/img/culillo.jpg',
    'http://localhost:3005/img/escarabajo.jpeg',
    'http://localhost:3005/img/pajaro.jpeg',
    'http://localhost:3005/img/rana.jpg',
    'http://localhost:3005/img/venado.jpg',
    'http://localhost:3005/img/acuario.jpg',
    'http://localhost:3005/img/anonymous.jpeg',
    'http://localhost:3005/img/nube.jpeg',
    'http://localhost:3005/img/wey.jpg',
    'http://localhost:3005/img/monitor.jpeg',
    'http://localhost:3005/img/1.jpg',
    'http://localhost:3005/img/2.jpg',
    'http://localhost:3005/img/3.jpg',
    'http://localhost:3005/img/4.jpg',
    'http://localhost:3005/img/5.jpg',
    'http://localhost:3005/img/6.jpg',
    'http://localhost:3005/img/7.jpg',
    'http://localhost:3005/img/8.jpg',
    'http://localhost:3005/img/9.jpg',
    'http://localhost:3005/img/10.jpg',
    'http://localhost:3005/img/11.jpg',
    'http://localhost:3005/img/12.jpg',
    'http://localhost:3005/img/13.jpg',
    'http://localhost:3005/img/14.jpg',
    'http://localhost:3005/img/15.jpg',
  ];

  return CategoryPath.find({}).then(docs => {
    for (let i = 0; i <= 200; i++) {
      const imageSrc = imagesArr[Math.abs(Math.round(Math.random() * imagesArr.length - 1))];
      const category = docs[Math.abs(Math.round(Math.random() * docs.length - 1))].categoryID;
      const name = lorem({
        count: 1, // Number of words, sentences, or paragraphs to generate.
        units: 'sentences', // Generate words, sentences, or paragraphs.
        sentenceLowerBound: 1, // Minimum words per sentence.
        sentenceUpperBound: 6, // Maximum words per sentence.
        format: 'plain', // Plain text or html
      });
      const description = lorem({
        count: 1, // Number of words, sentences, or paragraphs to generate.
        units: 'sentences', // Generate words, sentences, or paragraphs.
        sentenceLowerBound: 5, // Minimum words per sentence.
        sentenceUpperBound: 15, // Maximum words per sentence.
        format: 'plain', // Plain text or html
      });

      const price = Math.round(Math.random() * 1000);
      const stock = Math.round(Math.random() * 100);

      promiseArr.push(new Promise((resolve, reject) => {
        const newProduct = new Product({ name, description, category, price, stock, images: [{ src: imageSrc }] });
        return newProduct.validate().then(() => {
          newProduct.save().then(() => {
            resolve();
          });
        }).catch(errs => {
          reject(errs);
        });
      }));
    }

    return Promise.all(promiseArr).then(() => res.send('oK'));
  }).catch(errs => res.send(errs));
});

router.get('/api/updateTestProductsDate', (req, res, next) => Product.find({}).then(docs => {
  const promisesArr = [];

  docs.forEach(prod => {
    promisesArr.push(new Promise((resolve, reject) => {
      // Pause for 10 milliseconds
      const start = new Date().getTime();
      for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > 10) {
          break;
        }
      }

      prod.createdAt = Date.now();
      console.log(prod.createdAt);
      prod.save().then(() => resolve()).catch(err => reject(err, prod));
    }));
  });

  return Promise.all(promisesArr).then(() => res.send('ok'));
}).catch((err, prod) => {
  console.log(prod);
  next(err);
}));

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

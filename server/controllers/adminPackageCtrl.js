const express = require('express');

const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const folderSettings = require('../settings').folderSettings;
const Package = require('../models/package');
const newNotFndErr = require('../lib/generateErrors').generateNotFoundError;
const auth = require('../config/auth/strategies/basic');
// Configures where to store images for /api/packages/xxx/images POST
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve(__dirname, folderSettings.SERVER_ADMIN_IMAGES_FOLDER));
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

// ************
// ** Routes **
// ************
router.get('/api/admin/packages', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const options = req.query;
  // Filtering by name? Get a case insensitive regex for it
  if (options.filterBy && typeof options.filterBy.name === 'string' && options.filterBy.name.length >= 3) { options.filterBy.name = new RegExp(options.filterBy.name, 'i'); }

  return Package.listPaginated(options || {}).then(pagination => {
    const _packages = pagination.docs;
    const total = pagination.total;

    _packages.forEach(doc => {
      if (doc.enabled && doc.isExpired()) {
        doc.enabled = false;
        doc.save();
      }
    });

    return res.status(200).send({ results: _packages, count: total });
  }).catch(err => {
    next(err);
  });
});

router.get('/api/admin/packages/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).send('no object id received');

  return Package.getOnePopulated(id, 'packageItems.product').then(doc => {
    // populate every product category in packageItems
    if (!doc) {
      return res.status(400).send('Package doesn\'t exist.');
    }
    // Check if the package can stay enabled in case this is enabled.
    const checkPackage = new Promise((resolve, reject) => {
      if (doc.enabled && doc.isExpired()) {
        doc.enabled = false;
        doc.save().then(() => resolve()).catch(err => reject(err));
      } else {
        resolve();
      }
    });

    // package checked in a promise becose 'cuz populate can affect package saving.
    return checkPackage.then(() => {
      const populations = doc.packageItems.map(item => item.product.populateCategory(false));

      return Promise.all(populations).then(() => res.status(200).send(doc));
    });
  }).catch(err => {
    next(err);
  });
});

router.post('/api/admin/packages', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { _package } = req.body;
  if (!_package) { return res.status(400).send('Empty request!'); }

  return Package.validateAndSave(_package).then(doc => res.status(201).send(doc)).catch(err => {
    next(err);
  });
});

const uploadImage = multer({ storage }).single('image');
router.post('/api/admin/packages/:id/image', auth.authJwt, auth.adminRequire, (req, res, next) => Package.findById(req.params.id).then(doc => {
  if (!doc) return res.status(404).send('Package not found!');
  uploadImage(req, res, (err) => {
    if (err) return res.status(500).send(err);
    doc.setImage(req.file).then(image => res.status(200).send(image));
  });
}).catch(err => {
  next(err);
}));

router.delete('/api/admin/packages/:id/image', auth.authJwt, auth.adminRequire, (req, res, next) => Package.findById(req.params.id).then(doc => {
  if (!doc) { return res.status(404).send('Package not found!'); }

  const img = doc.image;

  if (!img) { return res.status(404).send('Imagen no encontrada en el paquete.'); }

  const imgFileName = path.basename(img.src);
  doc.image = null;

  doc.save().then(() => {
    fs.unlink(settings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, err => { });
    return res.status(204).send();
  });
}).catch(err => {
  next(err);
}));

router.patch('/api/admin/packages/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { patch } = req.body;
  if (!patch) return res.status(400).send('no patch received');

  return Package.findAndPatch(req.params.id, patch).then(doc => res.status(200).send(doc)).catch(err => {
    next(err);
  });
});

router.post('/api/admin/packages/:id/packageItems', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { packageItems } = req.body;// An array with the product ids to add

  if (!packageItems || !Array.isArray(packageItems) || packageItems.length < 1) { return res.status(400).send('No packageItems received'); }

  return Package.addItems(req.params.id, packageItems).then(doc => {
    if (doc) return res.status(200).send(doc);
    return res.status(404).send('Package not found.');
  }).catch(err => {
    next(err);
  });
});

router.put('/api/admin/packages/:packageID/packageItems', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { packageItems } = req.body;
  if (!packageItems || !Array.isArray(packageItems)) return res.status(400).send('packageItem not received');

  return Package.findById(req.params.packageID).then(doc => {
    if (!doc) { Promise.reject(newNotFndErr('Package not found')); }

    doc.packageItems = packageItems;

    return doc.save().then(() => doc.populateFields(['packageItems.product']).then(() => {
      // populate every product category in packageItems
      const populations = doc.packageItems.map(item => item.product.populateCategory(false));

      return Promise.all(populations).then(() => res.status(200).send({
        packageItems: doc.packageItems,
        _package: { enabled: doc.enabled, stock: doc.stock },
      }));
    }));
  }).catch(err => {
    next(err);
  });
});

router.delete('/api/admin/packages/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }
  Package.findByIdAndRemove(req.params.id).then(removedPackage => {
    if (!removedPackage) { return res.status(404).send('No found'); }

    // Just to trigger mongoose middleware
    // (See https://github.com/Automattic/mongoose/issues/1241)
    removedPackage.remove();

    const imgName = removedPackage.image ? path.basename(removedPackage.image.src) : null;
    if (imgName) {
      if (imgName && imgName.trim()) {
        fs.unlink(settings.SERVER_ADMIN_IMAGES_FOLDER + imgName, err => {
          console.log(err);
        });
      }
    }

    return res.status(202).send();
  }).catch(errs => {
    next(errs);
  });
});

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

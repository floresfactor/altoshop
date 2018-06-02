const express = require('express');

const router = express.Router();
const Package = require('../models/package');
const moment = require('moment');

router.get('/api/packages', (req, res, next) => {
  const options = req.query;

  options.filterBy = options.filterBy ? options.filterBy : {};
  // avoid send unabled and expired packages
  options.filterBy.enabled = true;
  options.filterBy.expirationDate = { $gte: new Date(moment().startOf('day').format()) };

  // Filtering by name? Get a case insensitive regex for it                 //why? options.filterBy.name.length >= 3 
  if (typeof options.filterBy.name === 'string' && options.filterBy.name.length >= 3) { options.filterBy.name = new RegExp(options.filterBy.name, 'i'); }

  return Package.listPaginated(options || {}).then(pagination => {
    const _packages = pagination.docs;
    const total = pagination.total;

    return res.status(200).send({ results: _packages, count: total });
  }).catch(err => {
    next(err);
  });
});

router.get('/api/packages/:id', (req, res, next) => {
  const { id: _id } = req.params;

  if (!_id) { return res.status(400).send('no object id received'); }

  const criteria = {
    _id: id,
    enabled: true,
    expirationDate: { $gte: new Date(moment().startOf('day').format()) },
  };

  return Package.find(criteria).then(doc => {
    if (!doc) { return res.status(400).send('Package not found.'); }

    return doc.deepPopulate('packageItems.product').then(doc => {
      // populate every product category in packageItems
      const populations = doc.packageItems.map(item => item.product.populateCategory(false));

      return Promise.all(populations).then(() => res.status(200).send(doc));
    });
  }).catch(err => {
    next(err);
  });
});

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

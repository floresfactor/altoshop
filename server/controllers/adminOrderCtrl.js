const express = require('express');

const router = express.Router();

const Order = require('../models/order');
const notFoundErr = require('../lib/generateErrors').generateNotFoundError;
// const adminAuthenticateBasic = require('../config/auth/strategies/basic').adminAuthenticateBasic;
const auth = require('../config/auth/strategies/basic');

router.get('/api/admin/orders', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const options = req.query;

  // Orders filtered by customer
  if (options.filterBy && options.filterBy.customer && options.filterBy.customer.length >= 3) {
    return Order.getOrdersfilteredByCustomer(options).then(resObj => res.send(resObj))
      .catch(err => {
        next(err);
      });
  }

  return Order.listPaginated(options).then(pagination => {
    const orders = pagination.docs;
    const total = pagination.total;

    // Include populated customer on full listed
    const populatePromises = orders.map(p => p.populateFields(['customer']));

    return Promise.all(populatePromises).then(() => res.send({ results: orders, count: total }));
  }).catch(err => {
    next(err);
  });
});

router.get('/api/admin/orders/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No order ID received'); }

  return Order.findById(req.params.id).then(doc => {
    if (!doc) { return next(notFoundErr('Order not found')); }

    return doc.populateFields(['customer', 'payments.paymentMethod']).then(doc => doc.populateOrderFromRecord().then(docObj => res.send(docObj)));
  }).catch(err => {
    next(err);
  });
});

module.exports = {
  register(app) {
    app.use(router);
  },
};

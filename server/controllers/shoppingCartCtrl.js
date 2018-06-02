const express = require('express');

const router = express.Router();

const Customer = require('../models/customer');
const auth = require('../config/auth/strategies/basic');
// const Product = require('../models/product');
// ************
// ** Routes **
// ************

router.get('/api/customers/:id/cartItems', auth.authJwt, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No customer ID received'); }

  return Customer.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    return doc.populateCartItems().then(cartItems => res.send(cartItems));
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/customers/:id/cartItems', auth.authJwt, (req, res, next) => {
  let { cartItems } = req.body;

  if (!cartItems) { return res.status(400).send('No items received'); }

  if (!req.params.id) { return res.status(400).send('No customer ID received'); }

  if (!Array.isArray(cartItems)) { cartItems = [cartItems]; }

  return Customer.findById(req.params.id).then(cust => {
    if (!cust) { return res.status(404).send('Record not found'); }

    cartItems.forEach(cartItem => {
      const existingItem = cust.cartItems.find(i => i.itemID == cartItem.itemID);

      if (existingItem) {
        if (existingItem.quantity != cartItem.quantity && cartItem.quantity > 0) { existingItem.quantity = cartItem.quantity; }
      } else if (cartItem.quantity > 0) { cust.cartItems.addToSet(cartItem); }
    });

    return cust.save().then(savedDoc => savedDoc.populateCartItems().then(cartItems => res.send(cartItems)));
  }).catch(errs => {
    next(errs);
  });
});

router.put('/api/customers/:id/cartItems', auth.authJwt, (req, res, next) => {
  let { cartItems } = req.body;

  if (!cartItems) { return res.status(400).send('No items received'); }

  if (!req.params.id) { return res.status(400).send('No customer ID received'); }

  if (!Array.isArray(cartItems)) { cartItems = [cartItems]; }

  return Customer.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    doc.cartItems = cartItems;
    return doc.save().then(savedDoc => savedDoc.populateCartItems().then(cartItems => res.send(cartItems)));
  }).catch(errs => {
    next(errs);
  });
});

router.delete('/api/customers/:id/cartItems/:cartItemID', auth.authJwt, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No customer ID received'); }

  if (!req.params.cartItemID) { return res.status(400).send('No cart item ID received'); }

  return Customer.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    doc.cartItems.pull(req.params.cartItemID);
    return doc.save().then((savedDoc) => savedDoc.populateCartItems().then(cartItems => res.send(cartItems)));
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

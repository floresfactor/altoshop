const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const mongodb = require('mongodb');

const Discount = require('../models/discount');

// ************
// ** Routes **
// ************
/*
router.get('/api/discounts/:id', (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No param received'); }

  // Verify if param is a valid ObjectID
  // If it's not an ObjectID, delegate to next handler route (api/discounts/:code)
  if (!(/^[a-f\d]{24}$/i.test(req.params.id))) { return next(); }

  return Discount.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    return res.send(doc);
  }).catch(errs => {
    next(errs);
  });
});

router.get('/api/discounts/:code', (req, res, next) => {
  if (!req.params.code || !(typeof req.params.code === 'string')) { return res.status(400).send('No discount Code received'); }

  return Discount.findOne({ code: req.params.code.toUpperCase() }).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    return res.send(doc);
  }).catch(errs => {
    next(errs);
  });
});
*/

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

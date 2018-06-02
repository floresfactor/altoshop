const express = require('express');

const router = express.Router();

const Branch = require('../models/branch');

// ************
// ** Routes **
// ************

router.get('/api/branches', (req, res, next) => Branch.find({}).then(docs => res.send(docs)).catch(errs => {
  next(errs);
}));

router.get('/api/branches/:id', (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No branch ID received'); }

  return Branch.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    return res.send(doc);
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

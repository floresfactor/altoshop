const express = require('express');

const router = express.Router();
// const adminAuthenticateBasic = require('../config/auth/strategies/basic').adminAuthenticateBasic;
const auth = require('../config/auth/strategies/basic');

const Branch = require('../models/branch');

// ************
// ** Routes **
// ************
// i need to refactor this!

router.post('/api/branches', auth.authJwt, auth.adminRequire, (req, res, next) => {
  let { branch } = req.body;

  if (!branch) { return res.status(400).send('No item received'); }

  branch = new Branch(branch);

  return branch.save().then(doc => res.send(doc)).catch(errs => {
    next(errs);
  });
});

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

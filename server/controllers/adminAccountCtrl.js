const express = require('express');

const router = express.Router();
const auth = require('../config/auth/strategies/basic');

const Account = require('../models/account');

router.get('/api/admin/account', auth.authJwt, auth.adminRequire, async (req, res, next) => {
  try {
    const { criteria, page, limit } = req.query;
    const accounts = await Account.listAll({ criteria, page, limit } || {});
    return res.status(200).send(accounts);
  } catch (e) {
    e.status(400).json({ message: 'Accounts not found' });
    next(e);
  }
});

router.post('/api/admin/account/:id/toggleAdmin', auth.authJwt, auth.adminRequire, async (req, res, next) => {
  try {
    if (!req.params.id) { return res.status(400).send('no object id received'); }
    const oldAccount = await Account.findById(req.params.id);
    if (oldAccount.isAdmin) {
      const account = await Account.findByIdAndUpdate(oldAccount._id, { isAdmin: false }, { new: true });
      return res.status(200).send(account);
    }
    const account = await Account.findByIdAndUpdate(oldAccount._id, { isAdmin: true }, { new: true });
    return res.status(200).send(account);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  register(app) {
    app.use(router);
  },
};

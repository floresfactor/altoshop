const express = require('express');

const router = express.Router();

// const Joi = require('joi');
const Customer = require('../models/customer');

const PaymentMethod = require('../models/paymentMethod');
const auth = require('../config/auth/strategies/basic');
// const { filteredBody, validateJoi, regExps } = require('../lib/util');

// ************
// ** Routes **
// ************

router.get('/api/customers/:id', auth.authJwt, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }

  return Customer.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Customer not found'); }

    return res.send(doc);
  }).catch(errs => {
    next(errs);
  });
});

// ******************************************************************
// *** Use to create customers under GUEST accounts (no account)
// *** For account-customers, goto -> accountCtrl
// ******************************************************************
router.post('/api/customers', (req, res, next) => {
  const { customer } = req.body;

  if (!customer || customer.account || customer._id) { return res.status(400).send('No customer recived / Wrong endpoint'); }

  const newCustomer = new Customer(customer);

  return newCustomer.save().then(savedCustomer => res.status(201).send(savedCustomer)).catch(errs => {
    next(errs);
  });
});

router.put('/api/customers/:id', auth.authJwt, (req, res, next) => {
  const { customer } = req.body;

  if (!customer) { return res.status(400).send('No customer recived'); }

  if (!req.params.id) { return res.status(400).send('No ID received'); }

  return Customer.findById(req.params.id).then(existingCustomer => {
    if (!existingCustomer) { return res.status(404).send('Customer not found'); }

    // Allow only certain properties to be modified
    existingCustomer.firstName = customer.firstName;
    existingCustomer.lastName = customer.lastName;
    existingCustomer.email = customer.email;
    existingCustomer.phone = customer.phone;

    return existingCustomer.save().then(savedCustomer => res.send(savedCustomer));
  }).catch(errs => next(errs));
});

router.get('/api/customers/:id/paymentMethods', auth.authJwt, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No customer ID received'); }

  return Customer.findById(req.params.id).then(doc => {
    if (!doc) { return res.status(404).send('Record not found'); }

    // Return customer with its payment methods (not (so) sensible information is returned though)
    return PaymentMethod.find({ customer: req.params.id }).then(pms => {
      const paymentMethods = pms.map(pm => ({
        _id: pm.id,
        type: pm.type,
        name: pm.name,
        last4: pm.last4,
        expMonth: pm.expMonth,
        expYear: pm.expYear,
        brand: pm.brand,
      }));

      return res.send(paymentMethods);
    });
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/customers/:id/paymentMethods', auth.authJwt, (req, res, next) => {
  const { paymentMethod } = req.body;

  if (!req.params.id) { return res.status(400).send('No customer ID received'); }

  // Validate we have a conekta token
  if (!paymentMethod || !paymentMethod.conektaToken) { return res.status(400).send('No payment method OR conekta token received'); }

  return Customer.findById(req.params.id).then(customer => {
    if (!customer) { return res.status(404).send('Customer not found'); }

    // Empty promise used for when we need to create a customer
    //  on external service before adding the paymentMethod
    let prePromise = () => new Promise((resolve) => resolve());

    // We need to have the customer created on external API (conekta)
    // to be able to create a payment method for it
    if (!customer.externalReference) {
      prePromise = customer.createExternal.bind(customer);
    }

    return prePromise().then(() => customer.addPaymentMethod(paymentMethod).then(pm => res.send(pm)));
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/customers/:id/createExernal', (req, res, next) => {
    if (!req.params.id)
        return res.status(400).send('No customer ID received');

    return Customer.findById(req.params.id).then(customer => {
        if (!customer)
            return res.status(404).send('Customer not found');

        const createExternal = customer.createExternal.bind(customer);

        return customer.externalReference ? Promise.resolve().then(() => res.send())
            : createExternal().then(() => {
                return res.send();
            });
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

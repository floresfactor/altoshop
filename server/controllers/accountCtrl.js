const express = require('express');
const Joi = require('joi');
const request = require('request-promise');

const router = express.Router();

const jwt = require('jsonwebtoken');

const Account = require('../models/account');
const Customer = require('../models/customer');

const auth = require('../config/auth/strategies/basic');
const EmailTemplateSender = require('../config/mailer/mailer').EmailTemplateSender;
const emailService = require('../config/mailer/emailService');
const constants = require('../lib/constants/resources');
const { filteredBody, validateJoi, regExps } = require('../lib/util');

// Refactory accounts controllers
// Schemas Joi Validations
// filter schemas
// filterBody is optional if Joi not work

const Schemas = {
  recoverAccount: Joi.object().keys({
    email: Joi.string()
      .email()
      .required(),
  }),
  resetAccont: Joi.object().keys({
    newPassword: Joi.string()
      .min(8)
      .required(),
    token: Joi.string().required(),
  }),
  singIn: Joi.object().keys({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required(),
    // captcha: Joi.string(),
  }),
  singUp: Joi.object().keys({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    captcha: Joi.string()
      .required(),
  }),
  createCustomer: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().regex(regExps.phoneSuffix),
    genere: Joi.string().valid('male', 'female', 'other').required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
  }),
};

const SchemaList = {
  account: {
    create: ['email', 'password', 'captcha'],
  },
  customer: {
    create: ['firstName', 'lastName', 'phone', 'genere', 'city', 'state'],
    update: ['firstName', 'lastName', 'phone', 'genere', 'city', 'state'],
  },
};

// Check if there is a user with the same email
router.post(
  '/account/register',
  auth.SignUpRateLimit,
  validateJoi(Schemas.singUp),
  async (req, res, next) => {
    const {
      email,
      password,
      captcha,
    } = filteredBody(req.body, SchemaList.account.create);
    try {
      const verifyUrlCaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${constants.GOOGLE_CAPTCHA_SECRET_KEY}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
  	  const verify = await request(verifyUrlCaptcha);
  	  const body = JSON.parse(verify);
      console.log(body);
      console.log(body.success);
	    if (body.success === false) {
        return res.status(400).json({ message: 'this captcha already expire' });
      }

      const foundAccount = await Account.findOne({ email });
      if (foundAccount) {
        return res.status(403).json({
          error: 'Email is already in use',
        });
      }

      // Create a new Account
      const newAccount = new Account({
        method: 'local',
        email,
        password,
      });
      const account = await newAccount.save();
      return res.status(201).json(account.toAuthJSON());
    } catch (e) {
      e.status = 400;
      return next(e);
    }
  }
);

router.post(
  '/account/login',
  auth.LoginRateLimit,
  validateJoi(Schemas.singIn),
  auth.authLocal,
  async (req, res, next) => {
    // const { captcha } = req.body;
    try {
      /* if (captcha !== null || captcha !== '') {
        const verifyUrlCaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${constants.GOOGLE_CAPTCHA_SECRET_KEY}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
        const verify = await request(verifyUrlCaptcha);
        const body = JSON.parse(verify);
        if (body.success === false) {
          return res.status(400).json({ message: 'this captcha already expire' });
        }
      }
      */
      const customer = await Customer.findOne({ account: req.user.id });
      if (!customer) {
        console.log('you dont have client account');
        return res.status(200).json(req.user.toAuthJSON());
      }
      const accountWithCustomer = {
        ...req.user.toAuthJSON(),
        customer,
      };
      return res.status(200).json(accountWithCustomer);
    } catch (e) {
      next(e);
    }
  }
);

router.post('/auth/google', auth.authGoogle, async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ account: req.user.id });
    if (!customer) {
      console.log('you dont have client account');
      return res.status(200).json(req.user.toAuthJSON());
    }
    const accountWithCustomer = {
      ...req.user.toAuthJSON(),
      customer,
    };
    return res.status(200).json(accountWithCustomer);
  } catch (e) {
    next(e);
  }
});

router.post('/auth/facebook', auth.authFacebook, async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ account: req.user.id });
    if (!customer) {
      console.log('you dont have client account');
      return res.status(200).json(req.user.toAuthJSON());
    }
    const accountWithCustomer = {
      ...req.user.toAuthJSON(),
      customer,
    };
    return res.status(200).json(accountWithCustomer);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/account/recoveAccountByEmail',
  auth.ResetAccountLimit,
  validateJoi(Schemas.recoverAccount),
  async (req, res, next) => {
    try {
      const account = await Account.findOne({
        email: req.body.email,
      }).populate('customer');
      if (!account) {
        return res.status(200).send({
          message: 'Email not found',
        });
      }
      jwt.sign({
        id: account._id,
      },
      constants.EMAIL_SECRET, {
        expiresIn: '2h',
      },
      async (err, emailToken) => {
        try {
          await EmailTemplateSender('recovery-pwd', {
            mailTo: account.email,
            name: account.email,
            email: account.email,
            token: emailToken,
            customer: account,
          });
        } catch (error) {
          console.log(error);
        }
      }
      );
      return res.status(200).send({
        message: 'Email has be sent',
        type: 'success',
      });
    } catch (error) {
      return res.status(400).json({
        message: 'Try again',
        type: 'error',
      });
    }
  }
);

router.post(
  '/account/resetPassword',
  validateJoi(Schemas.resetAccont),
  async (req, res, next) => {
    try {
      const {
        newPassword,
        token,
      } = req.body;
      const {
        id,
      } = await jwt.verify(token, constants.EMAIL_SECRET);
      const account = await Account.findById(id);
      if (!account) {
        return res.status(400).json({
          message: 'User not found',
        });
      }
      account.password = newPassword;
      await account.save();
      return res.status(200).json(account.toAuthJSON());
    } catch (error) {
      return res.status(400).json({
        message: 'Error',
        error,
      });
    }
  }
);

// ** Create customer with account

router.post('/account/customer', validateJoi(Schemas.createCustomer), auth.authJwt, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, genere, city, state } = await filteredBody(req.body, SchemaList.customer.create);
    const postDataCustomer = { firstName, lastName, phone, genere, city, state };
    const account = await Account.findById(req.user.id);

    if (!account) {
      return res.status(400).json({ message: 'Account not found' });
    }
    const existCustomer = await Customer.findOne({ account: account._id });
    if (existCustomer) {
      return res.status(400).json({ message: 'you already have a profile' });
    }
    await Customer.create({
      ...postDataCustomer,
      account: account._id,
      email: account.email,
    });
    const newAccount = await Account.findByIdAndUpdate(account._id, { isComplete: true }, { new: true });
    const customer = await Customer.findOne({ account: req.user.id });
    if (!customer) {
      console.log('you dont have client account');
      return res.status(200).json(req.user.toAuthJSON());
    }
    const accountWithCustomer = {
      ...newAccount.toAuthJSON(),
      customer,
    };
    return res.status(201).json(accountWithCustomer);
  } catch (error) {
    return next(error);
  }
});

// Update own account customer
router.put(
  '/account/customer',
  auth.authJwt,
  validateJoi(Schemas.createCustomer),
  async (req, res, next) => {
    const body = filteredBody(req.body, SchemaList.customer.update);
    try {
      const customer = await Customer.findOne({ account: req.user.id });
      if (!customer) {
        res.status(400).json({ message: 'You need complete you profile' });
        next();
      }
      if (customer.account.toString() !== req.user.id.toString()) {
        return res.sendStatus(401);
      }

      Object.keys(body).forEach(key => {
        customer[key] = body[key];
      });

      return res.status(200).json(await customer.save());
    } catch (error) {
      return next(error);
    }
  }
);

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const idvalidator = require('mongoose-id-validator');
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const bcrypt = require('bcryptjs');
const shortid = require('shortid');
const moment = require('moment');
const _ = require('underscore');
const constants = require('../lib/constants/resources');

const t = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const AccountSchema = new Schema({
  method: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    required: true,
  },
  providerId: {
    type: String,
  },
  password: {
    type: String,
    validate: {
      validator(password) {
        return password && password.length >= 8;
      },
      message: 'Password length must be at least 8',
    },
  },
  email: {
    type: String,
    validate: {
      validator(v) {
        return t.test(v);
      },
      message: '{VALUE} is not a valid email',
    },
    lowercase: true,
    unique: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
  },
  isAdmin: {
    type: Boolean,
    required: false,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// If roles array is empty push a default role

// Execute before each user.save() call
AccountSchema.pre('save', async function (next) {
  try {
    console.log('entered');
    /* if (this.method !== 'local') {
      next();
    }
    */
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Generate a password hash (salt + hash)
    const passwordHash = await bcrypt.hash(this.password, salt);
    // Re-assign hashed version over original, plain text password
    this.password = passwordHash;
    console.log('exited');
    next();
  } catch (error) {
    next(error);
  }
});

// Verify password match
AccountSchema.methods = {
  async authenticateUser(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new Error(error);
    }
  },
  createToken() {
    return jwt.sign({
      id: this._id,
    },
    constants.JWT_SECRET, { expiresIn: "12h" }
    );
  },
  toAuthJSON() {
    return {
      ...this.toJSON(),
      token: `JWT ${this.createToken()}`,
    };
  },
  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      isAdmin: this.isAdmin,
      isComplete: this.isComplete,
      customer: this.customer,
    };
  },

  // Populates account customer
  getWithCustomer() {
    return this.deepPopulate('customer');
  },

  authenticate(oldPassword, hashPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(oldPassword, hashPassword, (err, bool) => {
        if (err) {
          return reject({
            message: err,
          });
        }
        return resolve(bool);
      });
    });
  },

  // Checks password and, if match, generate new session tokens
  // return -> Updated account with new tokens
  basicAuthenticateAndGenerateSession(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) {
        return cb(err);
      }
      if (isMatch) {
        // Generate new session ID and expiration date
        this.sessionID = shortid.generate();
        this.sessionExpirationDate = moment()
          .add('7', 'days')
          .format(moment.defaultFormat);
        this.save()
          .then(doc => {
            cb(null, isMatch, doc);
          })
          .catch(err => {
            cb(err);
          });
      } else {
        // Incorrect password
        cb(null, isMatch);
      }
    });
  },

  // Checks sessionID match
  basicAuthenticate(sessionID, cb) {
    if (
      this.sessionID !== sessionID ||
      moment(this.sessionExpirationDate, moment.defaultFormat) < moment()
    ) {
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
};

AccountSchema.statics = {
  listAll(options) {
    const criteria = options.criteria || {};
    const page = Number(options.page) || 0;
    const limit = Number(options.limit) || 20;

    return this.find(criteria)
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .skip(limit * page)
      .exec();
  },
  toggleToAdmin(id, isAdmin) {
    return this.findOneAndUpdate(id, { isAdmin: !isAdmin }, { new: true });
  },

};

AccountSchema.plugin(uniqueValidator, {
  message: '{PATH} is already registered.',
});
AccountSchema.plugin(idvalidator);
AccountSchema.plugin(deepPopulate);

module.exports = mongoose.model('Account', AccountSchema);

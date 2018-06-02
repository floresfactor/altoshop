const Joi = require('joi');
const numeral = require('numeral');

const currencyFormat = (number) => numeral(number).format('0,0.00');

// Returns repeated values on an array, if any
const getNonUniqueValues = (arr, uniquePropName) => {
  if (!arr || !arr.length) return [];

  const cache = {};
  const results = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    if (cache[arr[i][uniquePropName]] === true) {
      results.push(arr[i][uniquePropName]);
    } else {
      cache[arr[i][uniquePropName]] = true;
    }
  }

  return results;
};

// Removes null and undefined values from an array and returns it
const getCleanArray = arr => {
  if (!arr) return;

  return arr.filter(x => x !== undefined && x !== null);
};

function filteredBody(body, schema) {
  const items = {};

  Object.keys(body).forEach(key => {
    if (schema.indexOf(key) >= 0) {
      items[key] = body[key];
    }
  });
  return items;
}

const validateJoi = Schemas => (req, res, next) => {
  const result = Joi.validate(req.body, Schemas);
  if (result.error) {
    return res.status(400).json(result.error);
  }
  if (!req.value) {
    req.value = {};
  }
  req.value.body = result.value;
  return next();
};

const regExps = {
  // Matches email@something.smt
  email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,

  phoneSuffix: /\+52\s\([0-9]{3}\)\s[0-9]{3}-[0-9]{2}-[0-9]{2}/,

};

const validationMessages = {
  invalidValue: 'this value: {VALUE} is not valid',
  invalidEmail: 'this email: {VALUE} is not valid',
  invalidPhonePrefix: 'this prefix:{VALUE} is not valid',
  invalidPhoneSufix: 'this phone: {VALUE} is not valid',
  shortPassword: 'password must be longer',
  repeatedField(field) {
    return `${field} already exist`;
  },
};

module.exports = {
  getNonUniqueValues,
  cleanArray: getCleanArray,
  filteredBody,
  validateJoi,
  regExps,
  validationMessages,
  currencyFormat,
};

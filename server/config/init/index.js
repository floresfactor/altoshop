const mongoose = require('mongoose');
const moment = require('moment');
const conekta = require('conekta');

const appSettings = require('../../settings').appSettings;

module.exports = function InitConfig() {
  // Set mongoose to work with es6 native promises
  mongoose.Promise = global.Promise;

  // 'finally' shim for promises
  require('promise.prototype.finally').shim();

  // Add moment locale
  // TODO: refactor this into a global configs file
  moment.locale(appSettings.DATE_LOCALE);

  // Configure conekta
  conekta.api_key = appSettings.CONEKTA_API_KEY;
  conekta.locale = appSettings.LANGUAGE;
};

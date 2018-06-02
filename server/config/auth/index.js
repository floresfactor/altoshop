const passport = require('passport');
const configureBasicAuth = require('./strategies/basic').Configure;

module.exports = {
  // Set auth main configuration
  configure(app) {
    // Main config
    app.use(passport.initialize());

    // Config strategies
    configureBasicAuth();
  },
};

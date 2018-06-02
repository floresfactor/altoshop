const configMiddleware = require('./express/configMiddleware');
const registerRoutes = require('./routes/registerRoutes');
const configureAuth = require('./auth').configure;
const initConfig = require('./init');

module.exports = function ConfigureServerApp(app) {
  configMiddleware(app);
  configureAuth(app);
  registerRoutes(app);
  initConfig();
};

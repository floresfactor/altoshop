// Logger
const logger = require('./requestLogger');

// Error handler
const errorHandler = require('./globalErrorHandler');

// Controllers
const accountCtrl = require('../../controllers/accountCtrl');
const adminAccountCtrl = require('../../controllers/adminAccountCtrl');
const adminProductGroupCtrl = require('../../controllers/adminProductGroupCtrl');
const packageCtrl = require('../../controllers/packageCtrl');
const adminPackageCtrl = require('../../controllers/adminPackageCtrl');
const adminOrderCtrl = require('../../controllers/adminOrderCtrl');
const orderCtrl = require('../../controllers/orderCtrl');
const customerCtrl = require('../../controllers/customerCtrl');
const recursiveCategoryCtrl = require('../../controllers/recursiveCategoryCtrl');
const adminProductCtrl = require('../../controllers/adminProductCtrl');
const shoppingCartCtrl = require('../../controllers/shoppingCartCtrl');
const branchCtrl = require('../../controllers/branchCtrl');
const adminBranchCtrl = require('../../controllers/adminBranchCtrl');
const displayItemCtrl = require('../../controllers/displayItemCtrl');
const discountCtrl = require('../../controllers/discountCtrl');
const adminDiscountCtrl = require('../../controllers/adminDiscountCtrl');
const conektaWebHookCtrl = require('../../controllers/conektaWebHookCtrl');
const settingsCtrl = require('../../controllers/settingsCtrl');
const utilCtrl = require('../../controllers/utilCtrl');
const adminSliderItemCtrl = require('../../controllers/adminSliderItemCtrl');
const contactCtrl = require('../../controllers/contactCtrl');
const adminBannerCtrl = require('../../controllers/adminBannerCtrl');
const subscribeCtrl = require('../../controllers/subscribeCtrl');

// Map routes to controllers
module.exports = function registerRoutes(app) {
    // Log each request in non-production mode
    logger.register(app);
    // Latency
    //app.use((req, res, next) => {
    //    setTimeout(() => next(), 500);
    //});    
    // Register controllers
    adminProductGroupCtrl.register(app);
    recursiveCategoryCtrl.register(app);
    packageCtrl.register(app);
    adminPackageCtrl.register(app);
    orderCtrl.register(app);
    adminOrderCtrl.register(app);
    accountCtrl.register(app);
    adminAccountCtrl.register(app);
    customerCtrl.register(app);
    adminProductCtrl.register(app);
    shoppingCartCtrl.register(app);
    branchCtrl.register(app);
    adminBranchCtrl.register(app);
    displayItemCtrl.register(app);
    discountCtrl.register(app);
    adminDiscountCtrl.register(app);
    conektaWebHookCtrl.register(app);
    settingsCtrl.register(app);
    utilCtrl.register(app);
    adminSliderItemCtrl.register(app);
    contactCtrl.register(app);
    adminBannerCtrl.register(app);
    subscribeCtrl.register(app);
    // Error handler, always register last
    // This catches any unhandled error on the app
    errorHandler.register(app);
};

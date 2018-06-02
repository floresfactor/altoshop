const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');

// const adminAuthenticateBasic = require('../config/auth/strategies/basic').adminAuthenticateBasic;

// router.get('/api/util/patchSkus', (req, res, next) => {
//     const patchPGSkus = () => {
//         return new Promise((resolve, reject) => {
//             let cursor = mongoose.model('ProductGroup').find({ sku: null }).cursor();
//             cursor.eachAsync((pg) => {
//                 pg.sku = mongoose.Types.ObjectId().toString();
//                 return pg.save();
//             }, (err) => {
//                 if (err) {
//                     return reject(err);
//                 }
//             }).then(() => {
//                 return resolve();
//             }).catch((err) => {
//                 return reject(err);
//             });
//         });
//     }

//     const patchDisplayItems = (modelName) => {
//         return new Promise((resolve, reject) => {
//             let cursor = mongoose.model('DisplayItem').find({ sku: null }).cursor();
//             cursor.eachAsync((di) => {
//                 return new Promise((resolve, reject) => {
//                     mongoose.model(modelName).findById(di.itemID).then(doc => {
//                         if(!doc)
//                             return resolve();
                        
//                         di.itemSku = doc.sku;
//                         di.save().then(() => {
//                             return resolve();
//                         });
//                     }).catch((err) => {
//                         return reject(err);
//                     });
//                 });
//             }, (err) => {
//                 if (err) {
//                     return reject(err);
//                 }
//             }).then(() => {
//                 return resolve();
//             }).catch((err) => {
//                 return reject(err);
//             });
//         });
//     };

//     return patchPGSkus().then(() => {
//         patchDisplayItems('Product').then(() => {
//             patchDisplayItems('ProductGroup').then(() => {
//                 return res.send('ok');
//             });
//         });
//     }).catch(err => {
//         return res.send(err);
//     });
// });

// Register routes-middleware on server app
module.exports = {
    register(app) {
        app.use(router);
    }
};
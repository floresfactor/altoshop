const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const patcher = require('jsondiffpatch').create();

const auth = require('../config/auth/strategies/basic');

const Discount = require('../models/discount');
const Product = require('../models/product');
const ProductGroup = require('../models/productGroup');

// ************
// ** Routes **
// ************

router.get('/api/discounts', auth.authJwt, auth.adminRequire, (req, res, next) => Discount.find({}).then(docs => {
  const discounts = docs;
  const total = docs.length;

  // Include categories on full listed
  return res.send({ results: discounts, count: total });

  // return res.send(docs);
}).catch(errs => {
  next(errs);
}));

router.post('/api/discounts', auth.authJwt, auth.adminRequire, (req, res, next) => {
  let { discount } = req.body;

  if (!discount) { return res.status(400).send('No item received'); }

  discount = new Discount(discount);

  return discount.save().then(doc => res.send(doc)).catch(errs => {
    next(errs);
  });
});

router.get('/api/discounts/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No ID received'); }
  console.log('here');
  return Discount.findById(req.params.id).then(discount => {
    if (!discount) { return res.status(404).send('Not found'); }

    const promises = [
      discount.populateProducts(),
      discount.populateGroups(),
    ];

    return Promise.all(promises).then(() => res.send(discount));
  }).catch(errs => {
    next(errs);
  });
});

router.patch('/api/discounts/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { patch } = req.body;

  if (!req.params.id) { return res.status(400).send('No ID received'); }

  if (!patch) { return res.status(400).send('No Patch received'); }

  Discount.findById(req.params.id).then(discount => {
    if (!discount) { return res.status(404).send('Not found'); }

    const patchedDiscount = patcher.patch(discount.toObject(), patch);

    // Loop through keys and compare db to patch
    Object.keys(patchedDiscount).forEach((key, index) => {
      if (key === '_v' || key === '_id' || key === 'items' || key === 'createdAt') { return; }

      if (key == 'validUntil') {
        discount[key] = new Date(patchedDiscount[key]);
        return;
      }

      if (patchedDiscount[key] != discount[key]) { discount[key] = patchedDiscount[key]; }
    });

    if (discount.isModified()) { return discount.save().then(() => res.send(discount)); }
    return discount.save().then(() => res.send(discount));
  }).catch(errs => {
    next(errs);
  });
});

// Add product or productGroups to a discount
router.post('/api/discounts/:id/productsGroups', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { items } = req.body;

  if (!req.params.id) { return res.status(400).send('No discount ID received'); }

  if (!items.length) { return res.status(400).send('No products or productGroups received'); }

  return Discount.findById(req.params.id).then(dcount => {
    if (!dcount) { return res.status(404).send(`No discount found with ID: ${req.params.id}`); }

    const itemsToAdd = [];
 
    // Check if items in request are already present in discount
    items.forEach(pg => {
      // Add item if not present
      if (!dcount.items.find(k => k.itemId == pg.itemId)) { itemsToAdd.push(pg); }
    });

    // Add new items to the set
    itemsToAdd.forEach(newItem => {
      dcount.items.addToSet(newItem);
    });

    if (itemsToAdd.length === 0) { return res.status(409).send({ currentItems: dcount.items, message: 'No new items were added. Items may already be included in discount' }); }

    // TODO: Add validation that checks if items are actual products or groups

    return dcount.save().then(() => res.status(201).send(dcount.items));
  }).catch(errs => {
    next(errs);
  });
});
// Deletes a product/products from a productGroup
// Also restores the product(s) displayItems for them to show again on main/client grid
router.delete('/api/discounts/:id/productsGroups', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { items } = req.query;

  if (!req.params.id) { return res.status(400).send('No productGroupID received'); }

  if (!items.length) { return res.status(400).send('No products received'); }

  // if (!Array.isArray(products) && typeof products === 'string') { products = [products]; } else if (!Array.isArray(products)) { return res.status(400).send('Products must be of arrayOf(string) or string type'); }

  return Discount.findById(req.params.id).then(dcount => {
    if (!dcount) { return res.status(404).send(`No discount found with ID: ${req.params.id}`); }

    // Adds values to the array if not already present
    dcount.items.pull(...items);

    // Disable productGroup if it has no products anymore
    // prodGroup.enabled = prodGroup.products.length > 0;
    return dcount.save().then(() => res.status(201).send(dcount.items));

    // return dcount.save().then(() =>
    //   // Add products to display items again
    //   mongoose.model('Product').addToDisplayItems(products).then(() => prodGroup.populateFields(['products']).then(() => {
    //     const populateProductsCategories = prodGroup.products.map(prod => new Promise((resolve) => {
    //       prod.populateCategory(false).then(() => resolve());
    //     }));

    //     return Promise.all(populateProductsCategories).then(() => res.send(prodGroup.products));
    //   }))
    // );
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

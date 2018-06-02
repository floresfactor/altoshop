const express = require('express');

const router = express.Router();
const _ = require('lodash');

const RecursiveCategory = require('../models/recursiveCategory');
const CategoryPath = require('../models/categoryPath');
const auth = require('../config/auth/strategies/basic');
// ************
// ** Routes **
// ************

router.get('/api/recursiveCategories', (req, res, next) => {
  RecursiveCategory.find({}).then(docs => res.send(docs)).catch(errs => {
    next(errs);
  });
});

router.get('/api/recursiveCategories/:id', (req, res, next) => {
  if (!req.params.id) { return res.status(400).send('No id received'); }

  CategoryPath.findOne({ categoryID: req.params.id }).then(categoryRecord => {
    if (!categoryRecord) { return res.status(404).send('Category not found'); }

    return RecursiveCategory.findCategoryByPath(categoryRecord.path, categoryRecord.categoryID).then(category => {
      if (!category) { return res.status(404).send('Category not found'); }

      return res.send(category);
    });
  }).catch(errs => {
    next(errs);
  });
});
// Todo: check if this goes here
router.post('/api/recursiveCategories', auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { category } = req.body;

  const doc = new RecursiveCategory(category);

  return doc.validate().then(() => doc.saveCategoryByPath().then(doc => res.send(doc))).catch(err => {
    next(err);
  });
});

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

const express = require('express');

const router = express.Router();

const DisplayItem = require('../models/displayItem');
const Discount = require('../models/discount');
const RecursiveCategory = require('../models/recursiveCategory');
const CategoryPath = require('../models/categoryPath');

// ************
// ** Client **
// ************

router.get('/api/displayItems', (req, res, next) => {
  let options = req.query;

  options = options || { filterBy: {} };
  options.filterBy = options.filterBy ? options.filterBy : {};

  // shows only product groups
  options.filterBy.itemType = 'productGroup';

  // Filtering by name? Get a case insensitive regex for it
  if (options.filterBy.name && typeof options.filterBy.name === 'string') { options.filterBy.name = new RegExp(options.filterBy.name, 'i'); }

  return DisplayItem.listPaginated(options || {}).then(pagination => {
    const displayItems = pagination.docs;
    const total = pagination.total;

    const populatePromises = displayItems.map(dp => new Promise((resolve) => {
      dp.populateItem().then(() => resolve());
    }));
        return Promise.all(populatePromises).then(() => {
                return res.send({ results: displayItems, count: total });
        });
    }).catch(errs => {
        next(errs);
    });
});

router.get('/api/displayItems/:sku', (req, res, next) => {
  if (!req.params.sku) { return res.status(400).send('No SKU received'); }

  DisplayItem.findOne({ itemSku: req.params.sku }).then(displayProd => {
    if (!displayProd) { return res.status(404).send('No found'); }

    return Promise.all([displayProd.populateItem(), displayProd.populateCategory(false)]).then(() => res.send(displayProd));
  }).catch(errs => {
    next(errs);
  });
});

router.get('/api/displayItems/category/:categoryID', (req, res, next) => {
  let options = req.query;

  if (!req.params.categoryID) { return res.status(400).send('Wrong GET method, category is required'); }

  options = options || { filterBy: {} };
  options.filterBy = options.filterBy ? options.filterBy : {};

  // shows only product groups
  options.filterBy.itemType = 'productGroup';

  // Filtering by name? Get a case insensitive regex for it
  if (options.filterBy.name && typeof options.filterBy.name === 'string') { options.filterBy.name = new RegExp(options.filterBy.name, 'i'); }

  // First, find the recursion path on CategoryPath collection
  return CategoryPath.findOne({ categoryID: req.params.categoryID }).then(categoryRecord => {
    if (!categoryRecord) { return res.status(404).send('Category not found'); }

    // Once found recursionPath, follow it to find the category doc
    return RecursiveCategory.findCategoryByPath(categoryRecord.path, categoryRecord.categoryID).then(category => {
      if (!category) { return res.status(404).send('Category not found'); }

      // Now we have the category document: find all display products descending from it
      return DisplayItem.findDescendantsOfCategory(category).then(displayItems =>
        // Paginate/filter the results
        DisplayItem.listPaginatedOverDocumentArray(displayItems, options).then(pagination => {
          const displayItems = pagination.docs;
          const total = pagination.total;

          // Populate the results
          const populatePromises = displayItems.map(dp => new Promise((resolve) => {
            dp.populateItem().then(() => resolve());
          }));

          return Promise.all(populatePromises).then(() => res.send({ results: displayItems, count: total }));
        })
      );
    });
  }).catch(errs => {
    next(errs);
  });
});

router.get('/api/displayItemsRandom', (req, res, next) => {
  const options = req.query;
  const { filterBy, fields, count } = options;

  let limit = Number(count);
  limit = limit != NaN ? limit : 0;

  if (filterBy && filterBy.name && typeof filterBy.name === 'string') { filterBy.name = new RegExp(filterBy.name, 'i'); }

  return DisplayItem.findRandom(filterBy, fields, { limit }, (err, results) => {
    if (!results) { return res.status(404).send('Not found'); }

    if (!err) {
      const populatePromises = results.map(result => result.populateItem());

      Promise.all(populatePromises).then(() => {
        res.status(200).send({ displayItems: results });
      });
    } else {
      next(err);
    }
  }).catch(errs => {
    next(errs);
  });
});

router.post('/api/displayItems/:sku/views', async (req, res, next)=>{
    if(!req.params.sku)
        return res.status(400).send('Not sku send');
    try{
        let di =  await DisplayItem.findOneAndUpdate({ itemSku: req.params.sku }, {$inc: {counterView: 1}});
        if(!di)
            return res.status(404).send('Not found');
        //NOTE: counterView field is alway on -1 from real on this doc
        return res.send(di);
    }catch(err){
        next(err);;
    }
});


// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

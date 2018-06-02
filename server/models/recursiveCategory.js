const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const CategoryPath = require('./categoryPath');

const generateValidationErrors = require('../lib/generateErrors').generateValidationErrors;
const generateNotFoundError = require('../lib/generateErrors').generateNotFoundError;

const RecursiveCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  path: {
    type: [Schema.Types.ObjectId],
    min: 0,
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
  updatedAt: {
    type: Date,
  },
});

RecursiveCategorySchema.add({
  subCategories: [RecursiveCategorySchema],
});

// Returns a children category by its path, or a parent category if empty path array
RecursiveCategorySchema.static('findCategoryByPath', function (path, categoryID) {
  // Top-level category
  if (!path.length) {
    return this.findById(categoryID);
  } // Nested category
  // TODO: THis logic is the same on other methods, refactor into a single function???
  return this.findById(path.shift()).then(topCategory => {
    if (!topCategory) { return Promise.reject(generateNotFoundError('Incorrect category path')); }

    let nestedCategory, 
      currentPath;
    let parentCategory = topCategory;

    while ((currentPath = path.shift()) &&
                (nestedCategory = parentCategory.subCategories.find(x => x.id == currentPath))) {
      parentCategory = nestedCategory;
    }

    // Make sure we have the parent category and the path was travelled entirelly
    if (!parentCategory || path.length !== 0) { return Promise.reject(generateNotFoundError('Incorrect category path')); }
            
    // Get the target element
    return Promise.resolve(parentCategory.subCategories.find(x => x.id == categoryID));
  });
});

// Use this method to save new category docs:
// 1. Validate there are not-repeated category names at root level of the new category
// 2. Validate new category path
// 3. Create CategoryPath collection records for the new category
// 3. Save
RecursiveCategorySchema.method('saveCategoryByPath', function () {
  const doc = this;
  const categoryCollection = doc.constructor;

  // Nested category
  if (doc.path && doc.path.length) {
    const path = [...doc.path];

    // Get top-level category
    return categoryCollection.findById(path.shift()).then(topCategory => {
      if (!topCategory) { return Promise.reject(generateNotFoundError('Incorrect category path')); }

      let nestedCategory, 
        currentPath;
      let parentCategory = topCategory;

      while ((currentPath = path.shift()) &&
                (nestedCategory = parentCategory.subCategories.find(x => x.id == currentPath))) {
        parentCategory = nestedCategory;
      }

      // Make sure we have the parent category and the path was travelled entirelly
      if (!parentCategory || path.length !== 0) { return Promise.reject(generateNotFoundError('Incorrect category path')); }

      // Check there are not duplicated sibling categories
      if (parentCategory.subCategories.filter(x => x.name == doc.name).length > 0) { return Promise.reject(generateValidationErrors([{ propertyName: 'name', message: 'There is already a category with this name at the same structure level' }])); }

      // Insert categoryPath record
      const categoryPathRecord = new CategoryPath({
        categoryID: doc._id,
        name: doc.name,
        path: doc.path,
      });

      // All ok, proceed to save record
      return categoryPathRecord.save().then(() => {
        // Insert nestedCategory at path
        parentCategory.subCategories.push(doc);
        return topCategory.save();
      });
    });
  } // Top-level category
  // Check there aren't sibling repeated categories
  return categoryCollection.find({ name: doc.name }).then(repeatedDocs => {
    // There is a category with the name already, throw error
    if (repeatedDocs && repeatedDocs.length) { return Promise.reject(generateValidationErrors([{ propertyName: 'name', message: 'There is already a category with this name at the same structure level' }])); }

    // Insert categoryPath record
    const categoryPathRecord = new CategoryPath({
      categoryID: doc._id,
      name: doc.name,
      path: doc.path,
    });

    // All ok, proceed to save doc and record
    return categoryPathRecord.save().then(() => doc.save());
  });
});

RecursiveCategorySchema.plugin(deepPopulate);

module.exports = mongoose.model('RecursiveCategory', RecursiveCategorySchema);

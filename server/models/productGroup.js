const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');
const mongoosePaginate = require('mongoose-paginate');

const DisplayItem = require('../models/displayItem');
const CategoryPath = require('../models/categoryPath');
const generateNativeValidationErrors = require('../lib/generateErrors').generateValidationNativeError;

const ProductGroupSchema = new Schema({
    category: {
        // Refers to a documnet in CategoryPath.categoryID
        // Using Mixes schema type just to be able to populate this field
        // ref: 'CategoryPath.categoryID', <-- This is true, but not supported by mongoose 
        type: Schema.Types.Mixed,         
        required: true,
        validate: {
            validator: function (val) {
                if(!this.isNew)
                    return true;

                // Verify it's a valid ObjectID
                if(!(/^[a-f\d]{24}$/i.test(val)))
                    return false;

                return true;
            },
            message: 'Invalid cast to ObjectID on category',            
        }
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        default: () => {
            return mongoose.Types.ObjectId().toString();
        },
        //must be URL safe, because is used on displayitems as URL
        validate:{
            validator: function(sku){
                return /^[a-zA-Z0-9_-]*$/.test(sku);
            },
            message: '{VALUE} must be letters, numbers and/or hyphens'
        }
    },    
    description: {
        type: String
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    image: {
        name: {
            type: String
        },
        src: {
            type: String
        }
    },
    tags: {
        type: [{ type: String, 
            validate:{
            validator: function(tag){
                if(!tag)
                    return true
                return !/\s+/.test(tag);
            },
            message: '{VALUE} must not contain spaces'
        }}],
        },
    createdAt: {
        type: Date,
        default: function() {
            return Date.now();
        },
        required: true
    },
    enabled: {
        type: Boolean,
        default: false,
        validate: {
            validator: function(val) {
                return val === false || val === true && this.products.length > 0;
            },
            message: "Can't enable a product group without products"
        }
    },
    updatedAt: {
        type: Date
    }
});

// ****** ****** ****** ****** *****
// ****** Pre-save / Pre-update ****
// ****** ****** ****** ****** *****

const commonSaveLogic = (productCtx) => {
    productCtx.updatedAt = Date.now();
};

ProductGroupSchema.pre('save', function (next) {
    next(commonSaveLogic(this));
});

ProductGroupSchema.pre('update', function (next) {
    next(commonSaveLogic(this));
});

// ****** ****** ****** ****** *****
// ******     Pre-validate      ****
// ****** ****** ****** ****** *****

ProductGroupSchema.pre('validate', function (next) {
    const doc = this;

    if (!doc.category)
        next(generateNativeValidationErrors('validation error', [{ propertyName: 'category', message: 'This field is required' }]));
    else {
        if (doc.isNew || doc.isModified('category')) {
            return CategoryPath.findOne({ categoryID: doc.category }).then(category => {
                if (!category)
                    next(generateNativeValidationErrors('validation error', [{ propertyName: 'category', message: 'Category not found' }]));

                next();
            });
        } else {
            next();
        }
    }
});

// ****** ****** ****** ****** ***** ******
// ******       Post save/remove       ****
// ****** ****** ****** ****** ***** ******

ProductGroupSchema.post('save', function(doc) {
    // Upsert displayItem records
    return DisplayItem.findOneAndUpdate({ itemID: doc._id },
        { $set: {
            itemSku: doc.sku,
            category: doc.category,
            name: doc.name,
            tags: doc.tags,
            itemType: 'productGroup',
            enabled: doc.enabled,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        } }, 
        {
            new: true,
            upsert: true
        }).catch((errs) => {
            // Todo: Log this
            console.log(errs);
        });
});

// Remove productGroup from displayItem records
ProductGroupSchema.post('remove', function(doc) {
    return DisplayItem.findOneAndRemove({ itemID: doc._id }).then(() => {
        // Restore productGroup products as displayItems records for them to show on grid again
        mongoose.model('Product').addToDisplayItems(doc.products.map(p_id => p_id.toString()));
    }).catch(errs => {
        // Todo: Log this
        console.log(errs);            
    });
}); 

// ****** ****** ****** ****** *****
// ******        Statics        ****
// ****** ****** ****** ****** *****

ProductGroupSchema.statics = {
    listPaginated(options) {
        const findQuery = options.filterBy || {};
        const currentPage = Number(options.currentPage) || 1;
        const pageSize = Number(options.pageSize) || 12;
        const sort = options.sortBy || { createdAt: -1 };

        return this.paginate(findQuery, { page: currentPage, limit: pageSize, sort });
    },
        // Validates a set of products not to be repeated, generates errors if they are
    // Todo: This is not used, will it be? Check the code before using (it's old)    
    validateNonRepeatedProductGroups(productGroup) {
    }        
};

// ****** ****** ****** ****** *****
// ******        Methods        ****
// ****** ****** ****** ****** *****

ProductGroupSchema.methods = {
    populateFields(populateFieldsArr, options) {
        return this.deepPopulate(populateFieldsArr || [], options || null);
    },
    // Categories are nested objects inside themselves, we need this method to find the product category
    populateCategory(includeSubCategories = true) {
        const productGroup = this;

        // Find category record
        return CategoryPath.findOne({ categoryID: productGroup.category }).then(categoryRecord => {
            if(!categoryRecord)
                return Promise.resolve();

            // Get the actual category object
            return mongoose.model('RecursiveCategory').findCategoryByPath(categoryRecord.path, categoryRecord.categoryID).then(category => {
                if(!category)
                    return Promise.resolve();

                if(!includeSubCategories)
                    category = Object.assign({}, category.toObject(), {subCategories: []});
                productGroup.category = category;
                return Promise.resolve();
            });
        });
    },
    
    checkDiscount() {
        let productGroup = this;
        let discountAmount = 0;

        return mongoose.model('ProductGroup').findById(productGroup._id).then(pg => {
            return mongoose.model('Discount').findOne({ 'items.itemId': productGroup._id }).then(dcount => {
                if (dcount)                
                    discountAmount = dcount.amount;

                return pg.populateFields(['products']).then(() => {
                    pg.products.forEach(prod => {
                        prod._doc.originalPrice = prod.price;
                        prod._doc.price = prod.price - ((discountAmount/100) * prod.price);
                        if ((discountAmount > 0) && dcount.enabled)
                            prod._doc.discounted = true;
                    });
                    productGroup = pg;
                    return Promise.resolve(productGroup);
                });
            });            
        });
    }
};

// ****** ****** ****** ****** *****
// ******   Plugins & Export    ****
// ****** ****** ****** ****** *****
ProductGroupSchema.plugin(deepPopulate);
ProductGroupSchema.plugin(idvalidator);
ProductGroupSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('ProductGroup', ProductGroupSchema);
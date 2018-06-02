import actionTypes from '../actions/actionTypes';

// ********************************************************************************************
// Receives: 
// categories: array containing all category objects
// strArray: array containing the ID's of the selected category path as [catId1, ... , catIdN]
//
// Returns:
// resArray = [categoryObjWithID1, ... , categoryObjWithIdN]
// ********************************************************************************************
const getObjectsOnStringPath = (categories, strArray, resArray) => {
    if (!resArray)
        resArray = [];

    categories.forEach((category) => {
        if (strArray.find(a => a == category._id))
            resArray.push(Object.assign({}, category));
        if (category.subCategories.length)
            getObjectsOnStringPath(category.subCategories, strArray, resArray);
    });

    return resArray;
}

// Receives a UIObj as:
//      UIObj = { selectedCategoryPath: ['categoryId1', ... ,'categoryIdN'] }
// and dispatches to store as:
//      UIObj = { selectedCategoryPath: ['categoryId1', ... ,'categoryIdN'], 
//                categoryPathObjects: [categoryObj1, ... categoryObjN] }   
export function setUICategorySelections(UIObj) {
    return (dispatch, getState) => {
        const categories = getState().recursiveCategories;
        const categoryPathObjects = getObjectsOnStringPath(categories || [], UIObj.selectedCategoryPath || []);

        dispatch({ type: actionTypes.SET_UI_CATEGORY_SELECTIONS, UIObj: Object.assign(UIObj, { categoryPathObjects }) });
        return Promise.resolve();
    };
}
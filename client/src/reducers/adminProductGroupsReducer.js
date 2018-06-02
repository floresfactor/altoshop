import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function AdminProductGroupsReducer(state = initialState.adminProductGroups, action) {
    switch (action.type) {
        case actionTypes.LOAD_PRODUCT_GROUPS_SUCCESS: {
            return action.productGroups;
        }
        case actionTypes.ADD_PRODUCT_GROUP_SUCCESS: {
            let { productGroup } = action;

            if (!productGroup)
                return state;

            return [productGroup, ...state];
        }
        case actionTypes.PATCH_PRODUCT_GROUP_SUCCESS: {
            let { productGroup: patchedProductGroup } = action;

            let oldProductGroup = state.find(pg => pg._id == patchedProductGroup._id);

            if (!oldProductGroup)
                return state;

            // We need to place the productGroup back were it was to keep UI state
            const indexOfOldProdPG = state.indexOf(oldProductGroup);
            // Keep productGroup categories (they don't come populated from server)
            patchedProductGroup.category = Object.assign({}, oldProductGroup.category);

            const newState = [...state.filter(p => p._id != oldProductGroup._id)];
            newState.splice(indexOfOldProdPG, 0, patchedProductGroup);
            return newState;            
        }
        case actionTypes.UPDATE_PRODUCT_GROUP_CATEGORY_SUCCESS: {
            let { productGroup: updatedProductGroup } = action;

            let oldProductGroup = state.find(pg => pg._id == updatedProductGroup._id);

            if (!oldProductGroup)
                return state;

            // We need to place the productGroup back were it was to keep UI state
            const indexOfOldPG = state.indexOf(oldProductGroup);

            const newState = [...state.filter(p => p._id != oldProductGroup._id)];
            newState.splice(indexOfOldPG, 0, updatedProductGroup);
            return newState;            
        }
        case actionTypes.DELETE_PRODUCT_GROUP_SUCCESS: {
            let { productGroupID } = action;

            if (!productGroupID)
                return state;

            return [...state.filter(pg => pg._id != productGroupID)];
        }
        case actionTypes.ADD_PRODUCT_GROUP_IMAGE_SUCCESS: {
            let productGroup = state.find(p => p._id == action.productGroupID);
            let { image } = action;
            
            if (!productGroup || !image)
                return state;

            const indexOfPG = state.indexOf(productGroup);
            productGroup = Object.assign({}, productGroup, { image });

            const newState = [...state.filter(pg => pg._id != productGroup._id)];
            newState.splice(indexOfPG, 0, productGroup);
            return newState;
        }

        case actionTypes.DELETE_PRODUCT_GROUP_IMAGE_SUCCESS: {
            let productGroup = state.find(pg => pg._id == action.productGroupID);

            if(!productGroup)
                return state;

            // We need to place the productGroup back were it was to keep UI state
            const indexOfPG = state.indexOf(productGroup);
            productGroup = Object.assign({}, productGroup, { image: null });

            const newState = [...state.filter(pg => pg._id != productGroup._id)];
            newState.splice(indexOfPG, 0, productGroup);
            return newState;
        }
        case actionTypes.ADD_PRODUCTS_TO_PRODUCT_GROUP_SUCCESS:
        case actionTypes.REMOVE_PRODUCTS_FROM_PRODUCT_GROUP_SUCCESS: {
            let { productGroupID } = action;

            if (!productGroupID)
                return state;

            const prodGroup = state.find(pg => pg._id == productGroupID);
            const indexOfPG = state.indexOf(prodGroup);

            if (!~indexOfPG)
                return state;

            const newProdGP = Object.assign({}, prodGroup, { products: action.newProductsArr || [] });            
            const newState = [...state.filter(pg => pg._id != productGroupID)];
            newState.splice(indexOfPG, 0, newProdGP);
            return newState;
        }
        case actionTypes.TOGGLE_PRODUCT_GROUP_ENABLED: {
            let { productGroupID, enabled } = action;

            if (!productGroupID)
                return state;

            const prodGroup = state.find(pg => pg._id == productGroupID);
            const indexOfPG = state.indexOf(prodGroup);

            if (!~indexOfPG)
                return state;

            const newProdGP = Object.assign({}, prodGroup, { enabled: !!enabled });            
            const newState = [...state.filter(pg => pg._id != productGroupID)];
            newState.splice(indexOfPG, 0, newProdGP);
            return newState;
        }
        case actionTypes.SEARCH_PRODUCT_GROUP_SUCCESS:
            return action.productsGroups;
        default:
            return state;
    }
}
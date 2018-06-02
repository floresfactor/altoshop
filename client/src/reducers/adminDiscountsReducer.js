import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function AdminDiscountsReducer(state = initialState.adminDiscounts, action) {
    switch (action.type) {
        case actionTypes.LOAD_ADMIN_DISCOUNTS_SUCCESS: {
            return action.discounts;
        }
        case actionTypes.ADD_ADMIN_DISCOUNT_SUCCESS: {
            let { discount } = action;

            if (!discount)
                return state;

            return [discount, ...state];
        }
        case actionTypes.PATCH_ADMIN_DISCOUNT_SUCCESS: {
            let { discount: patchedDiscount } = action;

            let oldDiscount = state.find(pg => pg._id == patchedDiscount._id);

            if (!oldDiscount)
                return state;

            // We need to place the productGroup back were it was to keep UI state
            const indexOfOldDiscount = state.indexOf(oldDiscount);
            // Keep productGroup categories (they don't come populated from server)
            patchedDiscount.category = Object.assign({}, oldDiscount.category);

            const newState = [...state.filter(p => p._id != oldDiscount._id)];
            newState.splice(indexOfOldDiscount, 0, patchedDiscount);
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
        case actionTypes.DELETE_ADMIN_DISCOUNT_SUCCESS: {
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
        default:
            return state;
    }
}
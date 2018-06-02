import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function AdminProductsReducer(state = initialState.adminProducts, action) {
    switch (action.type) {
        case actionTypes.LOAD_ADMIN_PRODUCTS_SUCCESS: {
            return action.products;
        }
        case actionTypes.ADD_ADMIN_PRODUCT_SUCCESS: {
            let { product } = action;

            if (!product)
                return state;

            return [product, ...state];
        }
        case actionTypes.PATCH_ADMIN_PRODUCT_SUCCESS: {
            let { product: patchedProduct } = action;

            let oldProd = state.find(p => p._id == patchedProduct._id);

            if (!oldProd)
                return state;

            // We need to place the product back were it was to keep UI state
            const indexOfOldProd = state.indexOf(oldProd);
            // Keep product categories (they don't come populated from server)
            patchedProduct.category = Object.assign({}, oldProd.category);

            const newState = [...state.filter(p => p._id != oldProd._id)];
            newState.splice(indexOfOldProd, 0, patchedProduct);
            return newState;            
        }
        case actionTypes.UPDATE_ADMIN_PRODUCT_CATEGORY_SUCCESS: {
            let { product: updatedProduct } = action;

            let oldProd = state.find(p => p._id == updatedProduct._id);

            if (!oldProd)
                return state;

            // We need to place the product back were it was to keep UI state
            const indexOfOldProd = state.indexOf(oldProd);

            const newState = [...state.filter(p => p._id != oldProd._id)];
            newState.splice(indexOfOldProd, 0, updatedProduct);
            return newState;            
        }
        case actionTypes.DELETE_ADMIN_PRODUCT_SUCCESS: {
            let { productID } = action;

            if (!productID)
                return state;

            return [...state.filter(p => p._id != productID)];
        }
        case actionTypes.ADD_ADMIN_PRODUCT_IMAGE_SUCCESS:
        case actionTypes.DELETE_ADMIN_PRODUCT_IMAGE_SUCCESS: {
            let prod = state.find(p => p._id == action.productID);

            if(!prod)
                return state;

            // We need to place the product back were it was to keep UI state
            const indexOfProd = state.indexOf(prod);
            prod = Object.assign({}, prod, { images: action.images });

            const newState = [...state.filter(p => p._id != prod._id)];
            newState.splice(indexOfProd, 0, prod);
            return newState;
        }
        case actionTypes.CLEAR_ADMIN_PRODUCTS: {
            return [];
        }
        default:
            return state;
    }
}
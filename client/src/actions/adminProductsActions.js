import Axios from 'axios';
import { diff } from "jsondiffpatch";

import actionTypes from '../actions/actionTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { setItemCount } from '../actions/pagerActions';
import { containsValidationErrors } from '../lib/validations';

const loadProductsSuccess = (products) => {
    return { type: actionTypes.LOAD_ADMIN_PRODUCTS_SUCCESS, products };
};

// We don't need this because products are refreshed from server when added:
//
// const addProductSuccess = (product, pageSize) => {
//     return { type: actionTypes.ADD_PRODUCT_SUCCESS, product, pageSize };
// };

const patchProductSuccess = (product) => {
    return { type: actionTypes.PATCH_ADMIN_PRODUCT_SUCCESS, product };
};

const updateProductCategorySuccess = (product) => {
    return { type: actionTypes.UPDATE_ADMIN_PRODUCT_CATEGORY_SUCCESS, product };
};

// We don't need this because products are refreshed from server when added:
//
// const deleteProductSuccess = (productID) => {
//     return { type: actionTypes.DELETE_PRODUCT_SUCCESS, productID };
// };

const addProductImageSuccess = (productID, images) => {
    return { type: actionTypes.ADD_ADMIN_PRODUCT_IMAGE_SUCCESS, productID, images };
};

const deleteProductImageSuccess = (productID, images) => {
    return { type: actionTypes.DELETE_ADMIN_PRODUCT_IMAGE_SUCCESS, productID, images };
};

export const clearProducts = () => {
    return { type: actionTypes.CLEAR_ADMIN_PRODUCTS };
};

export function loadProducts(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('loadProducts'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        return Axios.get(urls.apiAdminProductsURL() + query).then(response => {
            const { results: products, count } = response.data;
            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadProductsSuccess(products));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('loadProducts'));
        });
    };
}

export function addProduct(product, pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('addProduct'));

        return Axios.post(urls.apiAdminProductsURL(), { product }).then(res => {
            // const product = res.data;

            // We don't actually need to do this now as we refresh from server after this action runs:
            // dispatch(addProductSuccess(product, pageSize));

            return Promise.resolve();
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('addProduct'));
        });
    };
}

export function patchProduct(oldProduct, newProduct, showLoading = true) {
    return (dispatch) => {
        const patch = diff(oldProduct, newProduct);

        if (!patch)
            return Promise.resolve(oldProduct);

        if (showLoading)
            dispatch(beginAjaxCall('patchProduct'));

        return Axios.patch(urls.apiAdminProductsURL(oldProduct._id), { patch }).then(response => {
            const patchedProduct = response.data;

            dispatch(patchProductSuccess(patchedProduct));
            return Promise.resolve(patchedProduct);
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('patchProduct'));
        });
    };
}

export function deleteProduct(productID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('deleteProduct'));

        return Axios.delete(urls.apiAdminProductsURL(productID)).then(res => {
            // We don't actually need to do this now as we refresh from server after this action runs:
            // dispatch(deleteProductSuccess(productID));
            return Promise.resolve();
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('deleteProduct'));
        });
    };
}

export function updateProductCategory(productID, newCategoryID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('updateProductCategory'));

        return Axios.post(urls.apiAdminProductsURL(productID) + '/category', { category: newCategoryID }).then(res => {
            const updatedProduct = res.data;

            dispatch(updateProductCategorySuccess(updatedProduct));
            return Promise.resolve(updatedProduct);
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('updateProductCategory'));
        });
    };
}

export function addProductImage(productID, formData, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('addProductImage'));

        return Axios.post(urls.apiAdminProductsImagesURL(productID), formData).then((res) => {
            const newImagesArr = res.data;

            dispatch(addProductImageSuccess(productID, newImagesArr));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('addProductImage'));
        });
    };
}

export function deleteProductImage(productID, imageID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('deleteProductImage'));

        return Axios.delete(urls.apiAdminProductsImagesURL(productID, imageID)).then((res) => {
            const newImagesArr = res.data;

            dispatch(deleteProductImageSuccess(productID, newImagesArr));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('deleteProductImage'));
        });
    };
}
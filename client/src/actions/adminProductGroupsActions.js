import Axios from 'axios';
import { diff } from "jsondiffpatch";

import actionTypes from '../actions/actionTypes';
import VariableObjectTypes from '../lib/constants/variableObjectTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { setVariableObjectOnStore } from '../actions/variableObjectActions';
import { setItemCount } from '../actions/pagerActions';
import { containsValidationErrors } from '../lib/validations';
import qs from 'qs';

const loadProductGroupsSuccess = (productGroups) => {
    return { type: actionTypes.LOAD_PRODUCT_GROUPS_SUCCESS, productGroups };
};

// We don't need this because productGroups are refreshed from server when added:
//
// const addProductGroupSuccess = (productGroup, pageSize) => {
//     return { type: actionTypes.ADD_PRODUCT_GROUP_SUCCESS, productGroup, pageSize };
// };

const patchProductGroupSuccess = (productGroup) => {
    return { type: actionTypes.PATCH_PRODUCT_GROUP_SUCCESS, productGroup };
};

const updateProductGroupCategorySuccess = (productGroup) => {
    return { type: actionTypes.UPDATE_PRODUCT_GROUP_CATEGORY_SUCCESS, productGroup };
};

// We don't need this because productGroups are refreshed from server when added:
//
// const deleteProductGroupSuccess = (productGroupID) => {
//     return { type: actionTypes.DELETE_PRODUCT_GROUP_SUCCESS, productGroupID };
// };

const addProductGroupImageSuccess = (productGroupID, image) => {
    return { type: actionTypes.ADD_PRODUCT_GROUP_IMAGE_SUCCESS, productGroupID, image };
};

const deleteProductGroupImageSuccess = (productGroupID) => {
    return { type: actionTypes.DELETE_PRODUCT_GROUP_IMAGE_SUCCESS, productGroupID };
};

// We don't need this because the only productGroup that has its products totally populated (with categories)
// is stored and used from store.variableObject that way we don't need to mess with the productGroups array
//
// const addProductsToProductGroupSuccess = (productGroupID, newProductsArr) => {
//     return { type: actionTypes.ADD_PRODUCTS_TO_PRODUCT_GROUP_SUCCESS, productGroupID, newProductsArr };
// };

// We don't need this because the only productGroup that has its products totally populated (with categories)
// is stored and used from store.variableObject that way we don't need to mess with the productGroups array
//
// const removeProductsFromProductGroupSuccess = (productGroupID, newProductsArr) => {
//     return { type: actionTypes.REMOVE_PRODUCTS_FROM_PRODUCT_GROUP_SUCCESS, productGroupID, newProductsArr };
// };

const toggleProductGroupEnabled = (productGroupID, enabled) => {
    return { type: actionTypes.TOGGLE_PRODUCT_GROUP_ENABLED, productGroupID, enabled };
};

const searchProductGroupsSuccess = (productsGroups) => {
    return { type: actionTypes.SEARCH_PRODUCT_GROUP_SUCCESS, productsGroups };
};

const searchProductGroupTagsSuccess = (tags) => {
    return { type: actionTypes.SEARCH_PRODUCT_GROUP_TAGS_SUCCESS, tags };
};

export function loadProductGroups(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('loadProductGroups'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';
        return Axios.get(urls.apiAdminProductGroupsURL() + query).then(response => {
            const { results: productGroups, count } = response.data;

            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadProductGroupsSuccess(productGroups));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('loadProductGroups'));
        });       
    };
}

export function addProductGroup(productGroup, pagerName, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('addProductGroup'));

        return Axios.post(urls.apiAdminProductGroupsURL(), { productGroup }).then(res => {
            // const productGroup = res.data;

            // We don't actually need to do this now as we refresh from server after this action runs:
            // dispatch(addProductGroupSuccess(productGroup, pageSize));
            
            return Promise.resolve();
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('addProductGroup'));
        });
    };
}

export function patchProductGroup(oldProductGroup, newProductGroup, showLoading = true) {
    return (dispatch) => {
        const patch = diff(oldProductGroup, newProductGroup);

        if (!patch)
            return Promise.resolve(oldProductGroup);

        if (showLoading)
            dispatch(beginAjaxCall('patchProductGroup'));

        return Axios.patch(urls.apiAdminProductGroupsURL(oldProductGroup._id), { patch }).then(response => {
            const patchedProductGroup = response.data;

            dispatch(patchProductGroupSuccess(patchedProductGroup));
            return Promise.resolve(patchedProductGroup);
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('patchProductGroup'));
        });
    };
}

export function deleteProductGroup(productGroupID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('deleteProductGroup'));

        return Axios.delete(urls.apiAdminProductGroupsURL(productGroupID)).then(res => {
            // We don't actually need to do this now as we refresh from server after this action runs:
            // dispatch(deleteProductGroupSuccess(productGroupID));
            return Promise.resolve();
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('deleteProductGroup'));
        });
    };
}

export function updateProductGroupCategory(productGroupID, newCategoryID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('updateProductGroupCategory'));

        return Axios.post(urls.apiAdminProductGroupsURL(productGroupID) + '/category', { category: newCategoryID }).then(res => {
            const updatedProductGroup = res.data;

            dispatch(updateProductGroupCategorySuccess(updatedProductGroup));
            return Promise.resolve(updatedProductGroup);
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('updateProductGroupCategory'));
        });
    };
}

export function addProductGroupImage(productGroupID, formData, showLoading = true) {
    return (dispatch) => {
        if(showLoading)
            dispatch(beginAjaxCall('addProductGroupImage'));

        return Axios.post(urls.apiAdminProductGroupsURL(productGroupID) + '/image', formData).then((res) => {
            const newImage = res.data;

            dispatch(addProductGroupImageSuccess(productGroupID, newImage));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else 
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('addProductGroupImage'));
        });
    };
}

export function deleteProductGroupImage(productGroupID, imageID, showLoading = true) {
    return (dispatch) => {
        if(showLoading)
            dispatch(beginAjaxCall('deleteProductGroupImage'));

        return Axios.delete(urls.apiAdminProductGroupsURL(productGroupID) + '/image').then(() => {
            dispatch(deleteProductGroupImageSuccess(productGroupID));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else 
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('deleteProductGroupImage'));
        });
    };
}

export function addProductsToProductGroup(productGroupID, productIDsArr, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('addProductsToProductGroup'));

        return Axios.post(urls.apiAdminProductGroupsURL(productGroupID) + '/products', { products: productIDsArr }).then(response => {
            const newProductsArr = response.data;

            // Update the specific productGroup at redux_store.variableObject
            const targetStoreProductGroup = getState().variableObject;
            if(targetStoreProductGroup.variableObjectType == VariableObjectTypes.PRODUCT_GROUP) {
                const newProductGroup = Object.assign(targetStoreProductGroup, { products: newProductsArr });
                dispatch((setVariableObjectOnStore(newProductGroup, VariableObjectTypes.PRODUCT_GROUP)));
            }
            
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('addProductsToProductGroup'));
        });
    };
}

export function removeProductsFromProductGroup(productGroupID, productIDsArr, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('removeProductsFromProductGroup'));

        // Update the specific productGroup at redux_store.variableObject
        const targetStoreProductGroup = getState().variableObject;                    

        return Axios.delete(urls.apiAdminProductGroupsURL(productGroupID) + '/products', { params: {products: productIDsArr} }).then(response => {
            const newProductsArr = response.data;


            if(targetStoreProductGroup.variableObjectType == VariableObjectTypes.PRODUCT_GROUP) {
                const newProductGroup = Object.assign(targetStoreProductGroup, { products: newProductsArr });
                dispatch((setVariableObjectOnStore(newProductGroup, VariableObjectTypes.PRODUCT_GROUP)));

                if(!newProductsArr.length)
                    dispatch(toggleProductGroupEnabled(newProductGroup._id, false));
            }

            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else 
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('removeProductsFromProductGroup'));
        });
    };
}

export function searchProductGroups(search){
    return dispatch => {
        const queryObj = {
            filterBy: {
                name_or_sku: search
            },
            pageSize: 99
        };
        const query = qs.stringify(queryObj, { encode: false });
        return Axios.get(urls.apiAdminProductGroupsURL() + '?' + query)
            .then(response => {
                const { results: productGroups } = response.data;

                dispatch(searchProductGroupsSuccess(productGroups));
                return Promise.resolve();
            })
            .catch(error => {
                return Promise.reject(error.message || "An error ocurred");
            });
    };
}

export function searchProductGroupTags(search){
    return dispatch => {
        return Axios.get(urls.apiAdminProductGroupsURL() + 'Tags', {
            params: { search: search }
        })
            .then(response => {
                const { tags } = response.data;
                dispatch(searchProductGroupTagsSuccess(tags));
                return Promise.resolve();
            })
            .catch(error => {
                return Promise.reject(error.message || "An error ocurred");
            });
    };
}
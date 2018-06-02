import Axios from 'axios';
import { diff } from "jsondiffpatch";

import actionTypes from '../actions/actionTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { setItemCount } from '../actions/pagerActions';
import { containsValidationErrors } from '../lib/validations';
import { setVariableObjectOnStore } from './variableObjectActions';
import  VariableObjectTypes  from '../lib/constants/variableObjectTypes';

const loadProductsSuccess = (products) => {
    return { type: actionTypes.LOAD_ADMIN_PRODUCTS_SUCCESS, products };
};

const loadDiscountsSuccess = (discounts) => {
    return { type: actionTypes.LOAD_ADMIN_DISCOUNTS_SUCCESS, discounts };
};

const patchDiscountSuccess = (discount) => {
    return { type: actionTypes.PATCH_ADMIN_DISCOUNT_SUCCESS, discount };
};

const patchProductSuccess = (product) => {
    return { type: actionTypes.PATCH_ADMIN_PRODUCT_SUCCESS, product };
};

const updateProductCategorySuccess = (product) => {
    return { type: actionTypes.UPDATE_ADMIN_PRODUCT_CATEGORY_SUCCESS, product };
};

const addProductImageSuccess = (productID, images) => {
    return { type: actionTypes.ADD_ADMIN_PRODUCT_IMAGE_SUCCESS, productID, images };
};

const deleteProductImageSuccess = (productID, images) => {
    return { type: actionTypes.DELETE_ADMIN_PRODUCT_IMAGE_SUCCESS, productID, images };
};

export const clearProducts = () => {
    return { type: actionTypes.CLEAR_ADMIN_PRODUCTS };
};

export function loadDiscounts(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('loadDiscounts'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        return Axios.get(urls.apiDiscountsURL() + query).then(response => {
            const { results: discounts, count } = response.data;
            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadDiscountsSuccess(discounts));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('loadDiscounts'));
        });
    };
}

export function addDiscount(discount, pagerName, showLoading = true){
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('addDiscount'));

        return Axios.post(urls.apiDiscountsURL(), { discount }).then(res => {
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
                dispatch(endAjaxCall('addDiscount'));
        });
    };
}

export function patchDiscount(oldDiscount, newDiscount, showLoading = true) {
    return (dispatch) => {
        const patch = diff(oldDiscount, newDiscount);

        if (!patch)
            return Promise.resolve(oldDiscount);

        if (showLoading)
            dispatch(beginAjaxCall('patchDiscount'));

        return Axios.patch(urls.apiDiscountsURL(oldDiscount._id), { patch }).then(response => {
            const patchedDiscount = response.data;

            dispatch(patchDiscountSuccess(patchedDiscount));
            return Promise.resolve(patchedDiscount);
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject();
            }
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('patchDiscount'));
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

export function addProductsToDiscount(discountID, itemsArr, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('addProductsToDiscount'));

          const items = [];
          itemsArr.forEach(prod => {
                items.push({ itemId: prod, kind: 'product'});
            });
          return Axios.post(urls.apiDiscountsURL(discountID) + '/productsGroups', { items: items }).then(response => {
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
                dispatch(endAjaxCall('addProductsToDiscount'));
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

export function deleteProduct(discountID, itemsArr, showLoading = true) {
    console.log(itemsArr);
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('deleteProduct'));
        const items = [];
        itemsArr.forEach(prod => {
                items.push({ itemId: prod, kind: 'product'});
            });
        return Axios.delete(urls.apiDiscountsURL(discountID) + '/productsGroups', { params: { items: itemsArr } }).then(response => {
            const newProductsArr = response.data;
            // We don't actually need to do this now as we refresh from server after this action runs:
            // dispatch(deleteProductSuccess(productID));
            
            // Update the specific productGroup at redux_store.variableObject
            const targetStoreProductGroup = getState().variableObject;
            if(targetStoreProductGroup.variableObjectType == VariableObjectTypes.PRODUCT_GROUP) {
                const newProductGroup = Object.assign(targetStoreProductGroup, { products: newProductsArr });
                dispatch((setVariableObjectOnStore(newProductGroup, VariableObjectTypes.PRODUCT_GROUP)));
            }
            return Promise.resolve();
        }).catch(error => {
            if (containsValidationErrors(error)) {
                return Promise.reject(error.response.data.errors);
            } else {
                return Promise.reject(error.message || "An error occurred");
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

export function addProductGroupsToDiscount(discountID, itemsArr, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('addProductGroupsToDiscount'));

          const items = [];
          itemsArr.forEach(prod => {
                items.push({ itemId: prod, kind: 'productGroup'});
            });
          return Axios.post(urls.apiDiscountsURL(discountID) + '/productsGroups', { items: items }).then(response => {
            const newProductGroupsArr = response.data;

            // Update the specific productGroup at redux_store.variableObject
            const targetStoreProductGroup = getState().variableObject;
            if(targetStoreProductGroup.variableObjectType == VariableObjectTypes.PRODUCT_GROUP) {
                const newProductGroup = Object.assign(targetStoreProductGroup, { products: newProductGroupsArr });
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
                dispatch(endAjaxCall('addProductGroupsToDiscount'));
        });
    };
}
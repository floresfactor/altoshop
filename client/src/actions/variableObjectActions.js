import Axios from 'axios';

import actionTypes from '../actions/actionTypes';
import VariableObjectTypes from '../lib/constants/variableObjectTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';

const getProductGroupSuccess = (productGroup) => {
    return { type: actionTypes.GET_PRODUCT_GROUP_SUCCESS, productGroup };
};

const getDiscountSuccess = (discount) => {
    return { type: actionTypes.GET_DISCOUNT_SUCCESS, discount };
};

const getDisplayItemSuccess = (displayItem) => {
    return { type: actionTypes.GET_DISPLAY_ITEM_SUCCESS, displayItem };
};

const getPackageSuccess = (_package) => {    
    return { type: actionTypes.GET_PACKAGE_SUCCESS, _package };
};

const getAdminOrderSuccess = (order) => {
    return { type: actionTypes.GET_ADMIN_ORDER_SUCCESS, order };
};

const getCustomerOrderSuccess = (order) => {
    return { type: actionTypes.GET_CUSTOMER_ORDER_SUCCESS, order };
};

const getAppSettingsSuccess = (appSettings) => {
    return { type: actionTypes.GET_APP_SETTINGS_SUCCESS, appSettings };
};

const setAppSettingsSuccess = (newSettingObj) => {
    return { type: actionTypes.SET_APP_SETTINGS_SUCCESS, newSettingObj };
};

export const setVariableObjectOnStore = (obj, variableObjectType) => {
    if (!obj || !variableObjectType)
        throw new Error('Missing arguments');

    return { type: actionTypes.SET_VARIABLE_OBJECT_ON_STORE, obj, variableObjectType };
};

export const clearVariableObjectData = () => {
    return { type: actionTypes.CLEAR_VARIABLE_OBJECT_DATA };
};

export function getProductGroup(productGroupID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('getProductGroup'));

        return Axios.get(urls.apiAdminProductGroupsURL(productGroupID)).then(response => {
            const productGroup = response.data;
            dispatch(getProductGroupSuccess(productGroup));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('getProductGroup'));
        });
    };
}

export function getDiscount(discountID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('getDiscount'));

        return Axios.get(urls.apiDiscountsURL(discountID)).then(response => {
            const discount = response.data;
            dispatch(getDiscountSuccess(discount));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('getDiscount'));
        });
    };    
}

export function getDisplayItem(displayItemSku, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('getDisplayItem'));

        return Axios.get(urls.apidisplayItemsURL(displayItemSku)).then(response => {
            const displayItem = response.data;
            dispatch(getDisplayItemSuccess(displayItem));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('getDisplayItem'));
        });
    };
}

export function getPackage(packageID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('getPackage'));

        return Axios.get(urls.apiAdminPackagesURL(packageID)).then(response => {
            const _package = response.data;
            dispatch(getPackageSuccess(_package));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('getPackage'));
        });
    };
}

export function getDiscountByCode(code, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('getDiscountByCode'));

        return Axios.get(urls.apiDiscountsURL({ code: code })).then(response => {
            const discount = response.data;
            return Promise.resolve(discount);
        }).catch(errs => {
            return Promise.reject(errs);
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('getDiscountByCode'));
        });       
    };
}

export function getAdminOrder(orderID, showLoading = true) {
    return (dispatch) => {
        if(showLoading)
            dispatch(beginAjaxCall('getAdminOrder'));

        return Axios.get(urls.apiAdminOrdersURL(orderID)).then(response => {
            const order = response.data;
            dispatch(getAdminOrderSuccess(order));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
            return Promise.reject();
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('getAdminOrder'));
        });
    };
}

export function getCustomerOrder(orderID, showLoading = true) {
    return (dispatch) => {
        if(showLoading)
            dispatch(beginAjaxCall('getCustomerOrder'));

        return Axios.get(urls.apiOrdersURL(orderID)).then(response => {
            const order = response.data;
            dispatch(getCustomerOrderSuccess(order));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
            return Promise.reject();
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('getCustomerOrder'));
        });
    };
}

export function getAppSettings(showLoading = true) {
    return (dispatch) => {
        if(showLoading)
            dispatch(beginAjaxCall('getAppSettings'));

        return Axios.get(urls.apiAppSettingsURL()).then(response => {
            const appSettings = response.data;
            dispatch(getAppSettingsSuccess(appSettings));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
            return Promise.reject();
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('getAppSettings'));
        });
    };
}

export function setAppSettings(settingName, settingVal, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('setAppSettings'));

        return Axios.post(urls.apiAppSettingsURL(settingName), { value: settingVal }).then(response => {
            const newSettingObj = response.data;

            if(getState().variableObject.variableObjectType !== VariableObjectTypes.APP_SETTINGS)
                return;

            dispatch(setAppSettingsSuccess(newSettingObj));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
            return Promise.reject();
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('setAppSettings'));
        });
    };
}


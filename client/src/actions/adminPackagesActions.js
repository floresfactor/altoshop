import Axios from 'axios';
import actionTypes from '../actions/actionTypes';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { urls } from '../lib/http';
import { diff } from "jsondiffpatch";
import { containsValidationErrors } from '../lib/validations';
import { setItemCount } from '../actions/pagerActions';
import { setVariableObjectOnStore } from './variableObjectActions';
import VariableObjectTypes from '../lib/constants/variableObjectTypes';

const loadPackagesSuccess = (packages) => {
    return { type: actionTypes.LOAD_PACKAGES_SUCCESS, packages };
};

const patchPackageSuccess = (patchedPackage) => {
    return { type: actionTypes.PATCH_PACKAGE_SUCCESS, patchedPackage };
};

const addPackageSuccess = (savedPackage) => {
    return { type: actionTypes.ADD_PACKAGE_SUCCESS, savedPackage };
};

const deletePackageImageSuccess = (packageID) => {
    return { type: actionTypes.DELETE_PACKAGE_IMAGE_SUCCESS, packageID, image: null };
};

const uploadPackageImageSuccess = (packageID, image) => {
    return { type: actionTypes.UPLOAD_PACKAGE_IMAGE_SUCCESS, packageID, image };
};

const deletePackageSuccess = (packageID) => {
    return { type: actionTypes.DELETE_PACKAGE_SUCCESS, packageID };
};

const setPackageProperties = (packageID, props) => {
    return { type: actionTypes.SET_PACKAGE_PROPERTIES, packageID, props };
}

export function loadPackages(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('loadPackages'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        return Axios.get(urls.apiAdminPackagesURL() + query).then(response => {
            const { results: packages, count } = response.data;

            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadPackagesSuccess(packages));
            return Promise.resolve();
        }).catch(errorRes => {
            return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            dispatch(endAjaxCall('loadPackages'));
        });
    }
};

export function patchPackage(originalPackage, ModifiedPackage, showLoading = true) {
    return (dispatch) => {
        let patch = diff(originalPackage, ModifiedPackage);
        if (!patch)
            return Promise.resolve(originalPackage);

        if (showLoading)
            dispatch(beginAjaxCall('patchPackage'));

        return Axios.patch(urls.apiAdminPackagesURL(originalPackage._id), { patch }).then(response => {
            const patchedPackage = response.data;
            dispatch(patchPackageSuccess(patchedPackage));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('patchPackage'));
        });
    }
};

export function uploadImage(packageID, fd, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('uploadImage'));


        return Axios.post(urls.apiAdminPackagesImageURL(packageID), fd).then(response => {
            dispatch(uploadPackageImageSuccess(packageID, response.data));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))//May be unecesary
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('uploadImage'));
        });
    }
};

export function deleteImage(packageID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('deleteImage'));

        return Axios.delete(urls.apiAdminPackagesImageURL(packageID)).then(() => {
            dispatch(deletePackageImageSuccess(packageID));
            return Promise.resolve();
        }).catch(errorRes => {
            return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('deleteImage'));
        });
    }
};

export function putPackageItems(packageID, newPackageItems, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('putPackageItems'));

        const targetStoreProductGroup = getState().variableObject;

        return Axios.put(urls.apiAdminPackagesItemsURL(packageID), { packageItems: newPackageItems }).then(response => {
            const { packageItems, _package } = response.data;

            const newPackage = Object.assign(targetStoreProductGroup, { packageItems });

            if (targetStoreProductGroup.variableObjectType == VariableObjectTypes.ADMIN_PACKAGE) {
                dispatch(setVariableObjectOnStore(newPackage, VariableObjectTypes.ADMIN_PACKAGE));
            }

            const unPopPackageItems = packageItems.map(item => {
                let noPopItem = {};
                for (let key in item)
                    noPopItem[key] = (key == "product") ? item[key]._id : item[key];
                return noPopItem;
            });

            const props = {
                enabled: _package.enabled,
                stock: _package.stock,
                packageItems: unPopPackageItems
            };

            dispatch(setPackageProperties(newPackage._id, props));

            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('putPackageItems'));
        });
    }
};

export function addPackage(_package, pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('addPackage'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const pageSize = pager && pager.pageSize || 15;

        return Axios.post(urls.apiAdminPackagesURL(), { _package }).then(response => {
            dispatch(addPackageSuccess(response.data));
            return Promise.resolve();
        }).catch(errorRes => {
            if (containsValidationErrors(errorRes))
                return Promise.reject(errorRes.response.data.errors);
            else
                return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('addPackage'));
        });
    }
};

export function deletePackage(packageID, showLoading = true) {
    return (dispatch) => {
        if (showLoading)
            dispatch(beginAjaxCall('deletePackage'));

        return Axios.delete(urls.apiAdminPackagesURL(packageID)).then(() => {
            dispatch(deletePackageSuccess(packageID));
            return Promise.resolve();
        }).catch(errorRes => {
            return Promise.reject(errorRes.message || "An error occurred");
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('deletePackage'));
        });
    }
};
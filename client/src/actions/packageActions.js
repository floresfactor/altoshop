import Axios from 'axios';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { urls } from '../lib/http';
import { containsValidationErrors } from '../lib/validations';
import { setItemCount } from '../actions/pagerActions';

export function loadPackages(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if (showLoading)
            dispatch(beginAjaxCall('loadPackages'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        return Axios.get(urls.apiPackagesURL() + query).then(response => {
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

export function loadPackagesTest() {
    Axios.get(urls.apiPackagesURL()).then(response => {
        const { results: packages } = response.data;
        console.log("result query", packages);
    }).catch(errorRes => {
        return console.log("err", errorRes);
    });
};
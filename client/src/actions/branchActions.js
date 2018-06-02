import Axios from 'axios';

import actionTypes from '../actions/actionTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';

export function getAllBranches(showLoading = true) {
    return (dispatch) => {
        if(showLoading)
            dispatch(beginAjaxCall('getAllBranches'));

        return Axios.get(urls.apiBranchesURL()).then(response => {
            const branches = response.data;
            return Promise.resolve(branches);
        }).catch(error => {
            toastrError(error);
            return Promise.reject();
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('getAllBranches'));
        });
    };
}
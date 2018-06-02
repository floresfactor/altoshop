import Axios from 'axios';
import actionTypes from '../actions/actionTypes';

import { urls } from '../lib/http';

import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { setItemCount } from '../actions/pagerActions';
import { toastrError } from '../lib/toastrMessages';

const loadAdminOrdersSuccess = (orders) => {
    return { type: actionTypes.LOAD_ADMIN_ORDERS_SUCCESS, orders };
};

export function loadAdminOrders(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('loadAdminOrders'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        return Axios.get(urls.apiAdminOrdersURL() + query)
            .then(response => {
                const { results: orders, count } = response.data;

                if(pager)
                    dispatch(setItemCount(pager, count));

                dispatch(loadAdminOrdersSuccess(orders));
                return Promise.resolve();
            })
            .catch(error => {
                toastrError(error);
                return Promise.reject();
            }).finally(() => {
                if(showLoading)
                    dispatch(endAjaxCall('loadAdminOrders'));
            });
    };
}
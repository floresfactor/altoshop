import Axios from 'axios';
import actionTypes from '../actions/actionTypes';

import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';

import { loadShoppingCartItems } from '../actions/shoppingCartItemsActions';
import { setItemCount } from '../actions/pagerActions';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';

// We don't actually have a reducer for this
const createOrderSuccess = () => {
    return { type: actionTypes.CREATE_CUSTOMER_ORDER_SUCCESS };
};

const loadCustomerOrdersSuccess = (orders) => {
    return { type: actionTypes.LOAD_CUSTOMER_ORDERS_SUCCESS, orders };
};

export function createOrder(order, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('createOrder'));

        let customer = getState().customer;
        return Axios.post(urls.apiOrdersURL(), { order,customer }).then(response => {
            const newOrder = response.data;

            dispatch(createOrderSuccess());

            // Update shoppingCartItems/customer.shoppingCartItems on redux store after purchase
            dispatch(loadShoppingCartItems());

            return Promise.resolve(newOrder);
        }).catch(errs => {
            toastrError(errs);
            return Promise.reject(errs);
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('createOrder'));
        });
    };
}

export function loadCustomerOrders(pagerName, showLoading = true) {
    return (dispatch, getState) => {
        if(showLoading)
            dispatch(beginAjaxCall('loadCustomerOrders'));

        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';
        
        return Axios.get(urls.apiOrdersURL() + query).then(response => {
            const { results: orders, count } = response.data;

            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadCustomerOrdersSuccess(orders));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
            return Promise.reject();
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('loadCustomerOrders'));
        });
    };
}
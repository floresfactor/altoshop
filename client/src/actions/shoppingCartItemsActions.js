import Axios from 'axios';

import actionTypes from '../actions/actionTypes';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { createCustomer, updateCustomerCartItemsOnStore } from '../actions/customerActions';
import { accountLogout } from './accountActions';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';

const loadShoppingCartItemsSuccess = (cartItems) => {
    return { type: actionTypes.LOAD_SHOPPING_CART_ITEMS_SUCCESS, shoppingCartItems: cartItems };
};

const addOrUpdateShoppingCartItemsSuccess = (cartItems) => {
    return { type: actionTypes.ADD_OR_UPDATE_SHOPPING_CART_ITEMS_SUCCESS, shoppingCartItems: cartItems };
};

const removeShoppingCartItemSuccess = (cartItem_id) => {
    return { type: actionTypes.REMOVE_SHOPPING_CART_ITEM_SUCCESS, cartItem_id };
};

const setShoppingCartItemsSuccess = (cartItems) => {
    return { type: actionTypes.SET_SHOPPING_CART_ITEMS_SUCCESS, shoppingCartItems: cartItems };
};


// Returns the populated customer cart items
export function loadShoppingCartItems() {
    return (dispatch, getState) => {
        const customer = getState().account.customer;
         if (!customer || !customer._id) {
            dispatch(loadShoppingCartItemsSuccess([]));
            return Promise.resolve([]);
        }
        return Axios.get(urls.apiCustomerCartURL(customer._id)).then(response => {
            const  cartItems  = response.data;
            dispatch(loadShoppingCartItemsSuccess(cartItems));
            dispatch(updateCustomerCartItemsOnStore(cartItems.map(i => _.omit(i, 'item') ), customer));
            return Promise.resolve(cartItems);
        }).catch(errorResponse => {
            toastrError(errorResponse);
        });

    };
}

// Adds cart tiems to the customer cartItems array OR updates quantities if the items are already present
export function addOrUpdateShoppingCartItems(cartItemsArr, showLoading = true) {
    return (dispatch, getState) => {
        if(!cartItemsArr)
            throw new Error('No cart item!');
        if(showLoading)
            dispatch(beginAjaxCall('addOrUpdateShoppingCartItems'));

        let customer = getState().account.customer;

        return (Promise.resolve()).then(() => {
          return Axios.post(urls.apiCustomerCartURL(customer._id), { cartItems: cartItemsArr }).then(response => {
              const cartItems  = response.data;

              // Update the store.customer object which also has a list of cartItems (without 'item' prop though)
              dispatch(updateCustomerCartItemsOnStore(cartItems.map(i => _.omit(i, 'item') ), customer));
              console.log(cartItems);
              // Update store.shoppingCartItems
              dispatch(addOrUpdateShoppingCartItemsSuccess(cartItems));
              return Promise.resolve();
          }).catch(errorResponse => {
              if(errorResponse.response.status === 401){
                dispatch(accountLogout());
              }
              toastrError(errorResponse);
              return Promise.reject();
          }).finally(() => {
              if(showLoading)
                  dispatch(endAjaxCall('addOrUpdateShoppingCartItems'));
          });
      });
    };
}

// Replaces the whole array of customer.cartItems on server with cartItemsArr argument value
export function setShoppingCartItems(cartItemsArr, showLoading = true, customer = null) {
    return (dispatch, getState) => {
        if(!cartItemsArr)
            throw new Error('No cart items!');

        if(customer)
            customer = getState().account.customer;

        if(showLoading)
            dispatch(beginAjaxCall('setShoppingCartItems'));

        return (Promise.resolve()).then(() => {
            return Axios.put(urls.apiCustomerCartURL(customer._id), { cartItems: cartItemsArr }).then(response => {
                const  cartItems = response.data;

                // Update the store.customer object which also has a list of cartItems (without 'item' prop though)
                dispatch(updateCustomerCartItemsOnStore(cartItems.map(i => _.omit(i, 'item') )));

                // Update store.shoppingCartItems
                dispatch(setShoppingCartItemsSuccess(cartItems));
                return Promise.resolve();
            }).catch(errorResponse => {
                if(errorResponse.response.status === 401){
                  dispatch(accountLogout());
                }
                toastrError(errorResponse);
                return Promise.reject();
            }).finally(() => {
                if(showLoading)
                    dispatch(endAjaxCall('setShoppingCartItems'));
            });
        });
    };
}

export function removeShoppingCartItem(cartItem_id, showLoading = true) {
    return (dispatch, getState) => {
        if(!cartItem_id)
            throw new Error('No cart item!');

        if(showLoading)
            dispatch(beginAjaxCall('removeShoppingCartItem'));

        let customer = getState().account.customer;

        if(!customer && customer._id)
            throw new Error('Smt is very wrong here..!');

        return Axios.delete(urls.apiCustomerCartURL(customer._id) + '/' + cartItem_id).then(response => {
            // Update the customer object on store
            dispatch(updateCustomerCartItemsOnStore(customer.cartItems.filter(i => i._id != cartItem_id), customer));
            dispatch(removeShoppingCartItemSuccess(cartItem_id));
            return Promise.resolve();
        }).catch(errorResponse => {
            if(errorResponse.response.status === 401){
              dispatch(accountLogout());
            }
            toastrError(errorResponse);
            return Promise.reject();
        }).finally(() => {
            if (showLoading)
                dispatch(endAjaxCall('removeShoppingCartItem'));
        });
    };
}

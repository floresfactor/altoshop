import Axios from 'axios';

import actionTypes from '../actions/actionTypes';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { accountLogin, signSuccess } from '../actions/accountActions';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { containsValidationErrors, mapErrors } from '../lib/validations';

// Sets a customer object on redux store
const setCustomerOnStoreSuccess = (customer) => {
    return { type: actionTypes.SET_CUSTOMER_ON_STORE_SUCCESS, customer };
};

const createCustomerSuccess = (customer) => {
    return { type: actionTypes.CREATE_CUSTOMER_SUCCESS, customer };
};

const updateCustomerSuccess = (customer) => {
    return { type: actionTypes.UPDATE_CUSTOMER_SUCCESS, customer };
};

const loadCustomerPaymentMethodsSuccess = (paymentMethods) => {
    return { type: actionTypes.LOAD_CUSTOMER_PAYMENT_METHODS_SUCCESS, paymentMethods };
};

const addCustomerPaymentMethodSuccess = (paymentMethod) => {
    return { type: actionTypes.ADD_CUSTOMER_PAYMENT_METHOD_SUCCESS, paymentMethod };
};

const relateCustomerToAccountSuccess = (customer) => {
    return { type: actionTypes.RELATE_CUSTOMER_TO_ACCOUNT_SUCCESS, customer };
};

// This doesn't do any server changes, just update the store customer object
// To make server updates to shopping cart items -> ShoppingCartItemsActions
export const updateCustomerCartItemsOnStore = (cartItems, customer) => {
    return { type: actionTypes.UPDATE_CUSTOMER_CART_ITEMS_ON_STORE, cartItems, customer };
};

export function setCustomerOnStore(customer) {
    return (dispatch, getState) => {
        dispatch(setCustomerOnStoreSuccess(customer));
        return Promise.resolve();
    };
}

export function createCustomerOnExternal(customer) {
    return () => {
        return Axios.post(urls.apiCustomerURL + '/' + customer._id + '/createExernal').then(() => {
            return Promise.resolve();
        }).catch(errorResponse => {
            toastrError(errorResponse);
            return Promise.reject();
        });
    };
}

// When registering/logging-in accounts this logic happens on server:
// If(!account.customer) {
//  if((cust = customers.first(c => !c.account && c.email == account.email)))
//    account.customer = cust;
// }
//
// This function:
// Merges or creates account.customer with store.customer when !store.customer.email
export function setCustomerFromAccount(account) {
    return (dispatch, getState) => {
        // Get the account either by parameter OR redux store
        if (!account)
            account = getState().account;

        // Nothing to merge if we don't have the account on server
        if (!account.isLoggedIn)
            return Promise.resolve();

        // Get customer on redux store
        const storeCustomer = getState().account.customer;

        // There is a customer on server under the current account
        if (account.customer) {
            return Axios.get(urls.apiCustomerURL + '/' + account.customer).then(response => {
                const accountCustomer = response.data;

                // "Nobody's" customer with cart items: merge them with account.customer.cartItems
                if (!storeCustomer.email && storeCustomer._id != account.customer && storeCustomer.cartItems && storeCustomer.cartItems.length) {
                    const nonOnAccountCustomerCartItems = storeCustomer.cartItems.filter(sci =>
                        accountCustomer.cartItems.find(aci => aci.itemID == sci.itemID) === undefined
                    );

                    if (nonOnAccountCustomerCartItems.length) {
                        const mergedCartItems = [...accountCustomer.cartItems, ...nonOnAccountCustomerCartItems];
                        return Axios.put(urls.apiCustomerCartURL(accountCustomer._id), { cartItems: mergedCartItems }).then(response => {
                            const cartItems = response.data;
                            return dispatch(setCustomerOnStore(Object.assign(accountCustomer, { cartItems }))).then(() => Promise.resolve());
                        });
                    }
                }

                return dispatch(setCustomerOnStore(accountCustomer)).then(() => Promise.resolve());
            }).catch(errs => {
                toastrError(errs);
                return Promise.reject();
            });
        } else { // Account doesn't have a customer
            // "Nobody's" customer with cart items: relate the customer to account.customer
            if(storeCustomer && storeCustomer._id && !storeCustomer.email && storeCustomer.cartItems && storeCustomer.cartItems.length){
                return dispatch(relateCustomerToAccount(storeCustomer)).then(() => Promise.resolve());
            }

            return dispatch(setCustomerOnStore({})).then(() => Promise.resolve());
        }
    };
}

// Creates a customer on server, either a non-account customer if the account is not logged in (guest)
// or relates a customer to an already logged-in account
export function createCustomer(customer, showLoading = true) {
    return (dispatch, getState) => {
        // const account = getState().account;

        if(showLoading)
            dispatch(beginAjaxCall('createCustomer'));

        // If there is a loggedIn account, we need to create
        // the customer on the correct endpoint

        // Complete email from account, if necessary

        return Axios.post(urls.accountCustomer, {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          city: customer.city,
          state: customer.state,
          genere: customer.genere
         }).then(response => {
            const account = response.data;
            dispatch(signSuccess(account));
            dispatch(createCustomerSuccess(account.customer));
            return Promise.resolve(account.customer);
        }).catch(errorResponse => {
            if (containsValidationErrors(errorResponse)) {
                // throw errors to caller
                return Promise.reject(mapErrors(errorResponse.response.data.errors));
            } else { // Some other error
                toastrError(errorResponse);
                return Promise.reject();
            }
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('createCustomer'));
        });
    };
}

// Updates a customer on server
export function updateCustomer(updatedCustomer, showLoading = true) {
    return (dispatch, getState) => {
        const state = getState();

        if(!updatedCustomer)
            updatedCustomer = state.account.customer;

        if(showLoading)
            dispatch(beginAjaxCall('updateCustomer'));

        return Axios.put(urls.apiCustomerURL + '/' + updatedCustomer._id, { customer: updatedCustomer }).then(response => {
            const customer = response.data;

            dispatch(updateCustomerSuccess(customer));
            return Promise.resolve(customer);
        }).catch(errorResponse => {
            if (containsValidationErrors(errorResponse)) {
                // throw errors to caller
                return Promise.reject(mapErrors(errorResponse.response.data.errors));
            } else { // Some other error
                toastrError(errorResponse);
                return Promise.reject();
            }
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('updateCustomer'));
        });
    };
}

// Relates the current account to a customer, don't use if either the account
// already has a customer or the customer already has an account OR the customer is not
// already created on server
export function relateCustomerToAccount(customer, showLoading = true) {
    return (dispatch, getState) => {
        const state = getState();

        const account = state.account;

        if(!customer)
            customer = state.account.customer;

        if(!account || !customer || !account._id || !customer._id)
            throw new Error('Bad call');

        if(showLoading)
            dispatch(beginAjaxCall('relateCustomerToAccount'));

        return Axios.put(urls.accountsCustomerURL(account._id), { customer: customer }).then(response => {
            const customer = response.data;

            // Update account and customer
            dispatch(accountLogin(Object.assign({}, account, { customer: customer._id }), false));
            dispatch(relateCustomerToAccountSuccess(customer));
            return Promise.resolve(customer);
        }).catch(errorResponse => {
            toastrError(errorResponse);
            return Promise.reject();
        }).finally(() => {
            if(showLoading)
                dispatch(endAjaxCall('relateCustomerToAccount'));
        });
    };
}

export function loadCustomerPaymentMethods() {
    return (dispatch, getState) => {
        const customer = getState().account.customer;
        if (!customer || !customer._id)
            throw 'No customer on loadCustomerPaymentMethods';

        dispatch(beginAjaxCall('loadCustomerPaymentMethods'));
        return Axios.get(urls.apiCustomerPaymentMethodsURL(customer._id)).then(response => {
            const paymentMethods  = response.data;

            dispatch(loadCustomerPaymentMethodsSuccess(paymentMethods));
        }).catch(errorResponse => {
            toastrError(errorResponse);
        }).finally(() => {
            dispatch(endAjaxCall('loadCustomerPaymentMethods'));
        });
    };
}

export function addCustomerPaymentMethod(paymentMethod) {
    return (dispatch, getState) => {
        const customer = getState().account.customer;
        if (!customer || !customer._id)
            throw 'No customer on addCustomerPaymentMethod';

        dispatch(beginAjaxCall('addCustomerPaymentMethod'));

        return Axios.post(urls.apiCustomerPaymentMethodsURL(customer._id), { paymentMethod })
            .then(response => {
                const paymentMethod = response.data;

                dispatch(addCustomerPaymentMethodSuccess(paymentMethod));
                return Promise.resolve();
            })
            .catch(errorResponse => {
                toastrError(errorResponse);
                return Promise.reject();
            }).finally(() => {
                dispatch(endAjaxCall('addCustomerPaymentMethod'));
            });
    };
}

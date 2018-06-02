import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function CustomerReducer(state = initialState.account.customer, action) {
    switch (action.type) {
        case actionTypes.SET_CUSTOMER_ON_STORE_SUCCESS: {
            return Object.assign({}, action.customer, { cartItems: [...(action.customer.cartItems || [])] });
        }
        case actionTypes.SET_CUSTOMER_FROM_ACCOUNT_SUCCESS: {
            return Object.assign({}, action.customer);
        }
        case actionTypes.CREATE_CUSTOMER_SUCCESS: {
            return action.customer;
        }
        case actionTypes.UPDATE_CUSTOMER_SUCCESS: {
            return action.customer;
        }
        case actionTypes.LOAD_CUSTOMER_PAYMENT_METHODS_SUCCESS: {
            return Object.assign({}, state, { paymentMethods: action.paymentMethods });
        }
        case actionTypes.ADD_CUSTOMER_PAYMENT_METHOD_SUCCESS: {
            const customer = state;
            const newCustomerPaymentMethods = [...customer.paymentMethods, action.paymentMethod];
            return Object.assign({}, customer, { paymentMethods: newCustomerPaymentMethods });
        }
        case actionTypes.UPDATE_CUSTOMER_CART_ITEMS_ON_STORE: {
            const { customer } = action;
            if(!customer._id)
                throw new Error('No customer!');
            return Object.assign({}, customer, { cartItems: [...action.cartItems] });
        }
        case actionTypes.RELATE_CUSTOMER_TO_ACCOUNT_SUCCESS: {
            const { customer } = action;
            return Object.assign({}, customer, { cartItems: [...customer.cartItems || []] });
        }
        default:
            return state;
    }
}

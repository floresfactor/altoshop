import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function AdminCustomersReducer(state = initialState.customers, action) {
    switch (action.type) {
        case actionTypes.LOAD_CUSTOMERS_SUCCESS_ADMIN: {
            return action.customers;
        }
        case actionTypes.CREATE_CUSTOMER_SUCCESS_ADMIN: {
            return [...state, action.customer];
        }
        case actionTypes.UPDATE_CUSTOMER_SUCCESS_ADMIN: {
            const updatedCustomer = action.customer;
            return [...state.filter(c => c._id !== updatedCustomer._id), updatedCustomer];
        }
        default:
            return state;
    }
}
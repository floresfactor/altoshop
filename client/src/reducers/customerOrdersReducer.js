import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function CustomerOrdersReducer(state = initialState.customerOrders, action) {
    switch (action.type) {
        case actionTypes.LOAD_CUSTOMER_ORDERS_SUCCESS: {
            return action.orders;
        }
        default:
            return state;
    }
}
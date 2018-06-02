import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function AdminOrdersReducer(state = initialState.adminOrders, action) {
    switch (action.type) {
        case actionTypes.LOAD_ADMIN_ORDERS_SUCCESS: {
            return action.orders;
        }
        default:
            return state;
    }
}
import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';
import UIFlags from '../lib/constants/UIFlags';

export default function UIFlagsReducer(state = initialState.UIFlags, action) {
    switch (action.type) {
        case actionTypes.SHOW_SHOPPING_CART: {
            return Object.assign({}, state, { [UIFlags.showShoppingCart]: action[UIFlags.showShoppingCart] });
        }
        default:
            return state;
    }
}
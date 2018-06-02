import actionTypes from '../actions/actionTypes';
import UIFlags from '../lib/constants/UIFlags';

export function showShoppingCart(show) {
    return { type: actionTypes.SHOW_SHOPPING_CART, [UIFlags.showShoppingCart]: !!show };
}
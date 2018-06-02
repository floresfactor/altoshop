import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function ProductGroupsReducer(state = initialState.shoppingCartItems, action) {
    switch (action.type) {
        case actionTypes.LOAD_SHOPPING_CART_ITEMS_SUCCESS: {
            return action.shoppingCartItems;
        }
        case actionTypes.ADD_OR_UPDATE_SHOPPING_CART_ITEMS_SUCCESS: {
            return action.shoppingCartItems;
        }
        case actionTypes.REMOVE_SHOPPING_CART_ITEM_SUCCESS: {
            const shoppingCartItems = state;            
            return [...shoppingCartItems.filter(i => i._id != action.cartItem_id)];
        }
        default:
            return state;
    }
}
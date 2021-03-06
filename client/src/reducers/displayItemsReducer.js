import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function displayItemsReducer(state = initialState.displayItems, action) {
    switch (action.type) {
        case actionTypes.LOAD_DISPLAY_ITEMS_SUCCESS: {
            return action.displayItems;
        }
        case actionTypes.LOAD_CATEGORY_DISPLAY_ITEMS_SUCCESS: {
            return action.displayItems;
        }
        case actionTypes.LOAD_DISPLAY_ITEMS_INFINITE_SUCCESS: {
            return [...state, ...action.displayItems]
        }
        case actionTypes.REMOVE_DISPLAY_ITEMS_SUCCESS: {
            return initialState.displayItems
        }
        default:
            return state;
    }
}
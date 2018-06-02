import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function displayItemsCategoryReducer(state = initialState.displayItems, action) {
  switch (action.type) {
      case actionTypes.LOAD_DISPLAY_ITEMS_CATEGORY_SUCCESS: {
          return action.displayItems;
      }
      case actionTypes.REMOVE_DISPLAY_ITEMS_CATEGORY_SUCCESS:
        return initialState.displayItems
      default:
          return state;
  }
}
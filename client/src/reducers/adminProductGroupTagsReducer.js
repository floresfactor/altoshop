import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function AdminProductGroupTagsReducer(state = initialState.productGroupTags, action){
  switch(action.type){
    case actionTypes.SEARCH_PRODUCT_GROUP_TAGS_SUCCESS:
      return action.tags
    default:
      return state
  }
}
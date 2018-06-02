import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function RecursiveCategoriesReducer(state = initialState.recursiveCategories, action) {
    switch (action.type) {
        case actionTypes.LOAD_RECURSIVE_CATEGORIES_SUCCESS:
            return action.recursiveCategories;
        case actionTypes.FILTER_RECURSIVE_CATEGORIES_SUCCESS:{
            return action.category.subCategories.map( cat=>{
                return Object.assign({},cat);
                });
        }
        default:
            return state;
    }
}
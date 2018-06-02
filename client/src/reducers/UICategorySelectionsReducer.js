import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function CategoriesReducer(state = initialState.UICategorySelections, action) {
    switch (action.type) {
        // Receives a UIObj as:
        //      action.UIObj = { selectedCategoryPath: ['categoryId1', ... ,'categoryIdN'], 
        //                       categoryPathObjects: [categoryObj1, ... categoryObjN] }   
        case actionTypes.SET_UI_CATEGORY_SELECTIONS:
            return Object.assign({}, state, action.UIObj);
        default:
            return state;
    }
}
import Axios from 'axios';

import actionTypes from '../actions/actionTypes';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';

const loadRecursiveCategoriesSuccess = (recursiveCategories) => {
    return { type: actionTypes.LOAD_RECURSIVE_CATEGORIES_SUCCESS, recursiveCategories };
};

const filterRecursiveCategoriesSuccess = (category) =>{
    return { type: actionTypes.FILTER_RECURSIVE_CATEGORIES_SUCCESS, category }
};

export function loadRecursiveCategories() {
    return (dispatch) => {
        // -> Server
        return Axios.get(urls.apiRecursiveCategoryURL()).then(response => {
            dispatch(loadRecursiveCategoriesSuccess(response.data));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        });
    };
}

export function getCategory(categoryID) {
    return (dispatch) => {
        return Axios.get(urls.apiRecursiveCategoryURL(categoryID)).then(response => {
            return Promise.resolve(response.data);
        }).catch(error => {
            return Promise.reject(error);
        });
    };
}

export function filterRecursiveCategories(category){
    return dispatch => {
        return dispatch(filterRecursiveCategoriesSuccess(category));
    }
}
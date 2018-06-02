import Axios from 'axios';

import actionTypes from '../actions/actionTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { setItemCount } from '../actions/pagerActions';
import qs from 'qs';

const loadDisplayItemsSuccess = (displayItems) => {
    return { type: actionTypes.LOAD_DISPLAY_ITEMS_SUCCESS, displayItems };
};

const removeDisplayItemsSuccess = ()=>{
    return { type: actionTypes.REMOVE_DISPLAY_ITEMS_SUCCESS };
};

const loadCategoryDisplayItemsInfiniteSuccess = (displayItems)=>{
    return { type: actionTypes.LOAD_DISPLAY_ITEMS_INFINITE_SUCCESS, displayItems }
};

const loadCategoryDisplayItemsSuccess = (displayItems) => {
    return { type: actionTypes.LOAD_CATEGORY_DISPLAY_ITEMS_SUCCESS, displayItems };
};

const removeCategoryDisplayItemsCategorySuccess = ()=>{
    return { type: actionTypes.REMOVE_DISPLAY_ITEMS_CATEGORY_SUCCESS }
};

const loadDisplayItemsCategorySuccess = (displayItems) =>{
    return { type: actionTypes.LOAD_DISPLAY_ITEMS_CATEGORY_SUCCESS, displayItems}
};

export function loadDisplayItems(pagerName) {
    return (dispatch, getState) => {
        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        return Axios.get(urls.apidisplayItemsURL() + query).then(response => {
            const { results: products, count } = response.data;

            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadDisplayItemsSuccess(products));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        });
    };
}

export function removeDisplayItems(){
    return dispatch => {
        dispatch(removeDisplayItemsSuccess());
    }
}

// Gets the products belonging to an specific category and it's subcategories
export function loadCategoryDisplayItems(categoryID, pagerName) {
    return (dispatch, getState) => {
        const pager = pagerName ? getState().pagers[pagerName] : null;
        const query = pager ? '?' + pager.toQueryString() : '';

        // -> Server
        return Axios.get(urls.apidisplayItemsURL(null, categoryID) + query).then(response => {
            const { results: products, count } = response.data;

            if (pager)
                dispatch(setItemCount(pager, count));

            dispatch(loadCategoryDisplayItemsSuccess(products));
            return Promise.resolve();
        }).catch(error => {
            toastrError(error);
        });
    };
}

export function getdisplayItemsByTag(tagsArray) {
    return (dispatch, getState) => {
        const filterBy = {
            tags: { $in: tagsArray || ['___'] }
        };

        const query = '?' + $.param({ filterBy: filterBy });

        return Axios.get(urls.apidisplayItemsURL + query).then(response => {
            const { results: products, count } = response.data;

            return Promise.resolve(products);
        }).catch(error => {
            toastrError(error);
        });
    };
}

export function getRandomProducts(options) {
    return (dispatch, getState) => {

        const query = '?' + $.param(options);
        const url = urls.apidisplayItemsURL() + 'Random' + query;
        return Axios.get(url).then(response => {
            const { displayItems: products } = response.data;

            return Promise.resolve(products);
        }).catch(error => {
            toastrError(error);
        });
    };
}

export function loadDisplayItemsWithOutPager(options){
    return (dispatch)=>{
        return Axios.get(urls.apidisplayItemsURL(),{params: options,
                paramsSerializer:(params)=>{
                    return qs.stringify(params,{encode: false});
                }})
            .then( res =>{
                const { results: products, count } = res.data;
                dispatch(loadCategoryDisplayItemsInfiniteSuccess(products));
                return Promise.resolve();
            }).catch(err =>{
                toastrError(err);
            });
    }
}

export function loadCategoryDisplayItemsCategory(categoryID, options){
    return dispatch =>{
        return Axios.get(urls.apidisplayItemsURL(null, categoryID),{params: options,
            paramsSerializer:(params)=>{
                return qs.stringify(params,{encode: false});
            }})
            .then(res =>{
                const { results: products, count } = res.data;
                dispatch(loadDisplayItemsCategorySuccess(products));
                return Promise.resolve();
            })
            .catch(err =>{
                toastrError(err);
            });
    }
}

export function removeCategoryDisplayItemsCategory(){
    return dispatch =>{
        dispatch(removeCategoryDisplayItemsCategorySuccess());
    }
}
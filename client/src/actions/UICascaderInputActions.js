import actionTypes from '../actions/actionTypes';

export function setSearch(searchVal) {
    return { type: actionTypes.SET_UI_CASCADER_INPUT_SEARCH, search: searchVal };
}
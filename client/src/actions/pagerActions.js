import actionTypes from '../actions/actionTypes';

export function goToPage(pager, page) {
    return (dispatch, getState) => {
        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.GO_TO_PAGE, pagerName, page });
        return Promise.resolve();
    };
}

export function setPageSize(pager, pageSize) {
    return (dispatch, getState) => {

        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.SET_PAGE_SIZE, pagerName, pageSize });
        return Promise.resolve();
    };
}

export function setItemCount(pager, itemCount) {
    return (dispatch, getState) => {

        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.SET_ITEM_COUNT, pagerName, itemCount });
        return Promise.resolve();
    };
}

export function setSortBy(pager, sortBy) {
    return (dispatch, getState) => {

        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.SET_SORT_BY, pagerName, sortBy });
        return Promise.resolve();
    };
}

export function setFilterBy(pager, filterBy) {
    return (dispatch, getState) => {

        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.SET_FILTER_BY, pagerName, filterBy });
        return Promise.resolve();
    };
}

export function createPager(pager, currentPage, pageSize, itemCount, sortBy, filterBy) {
    return (dispatch, getState) => {
        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.CREATE_PAGER, pagerName, currentPage, pageSize, itemCount, sortBy, filterBy });
        return Promise.resolve();
    };
}

export function updatePager(pager, currentPage, pageSize, itemCount, sortBy) {
    return (dispatch, getState) => {

        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.UPDATE_PAGER, pagerName, currentPage, pageSize, itemCount, sortBy });
        return Promise.resolve();
    };
}

export function removePager(pager) {
    return (dispatch, getState) => {

        const pagerName = typeof pager === 'object' ? pager.pagerName : pager;
        dispatch({ type: actionTypes.REMOVE_PAGER, pagerName });
        return Promise.resolve();
    };
}
import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

const createPager = (pagerName, currentPage = 1, pageSize = 15, itemCount = 0, sortBy = {}, filterBy = {}) => {
    return {
        pagerName,
        currentPage,
        pageSize,
        itemCount,
        sortBy: sortBy || {},
        filterBy: filterBy || {},
        toQueryString: function() {
            const obj = _.omit(this, 'toQueryString');
            return $.param(obj || {});
        }
    };
};

export default function pagersReducer(state = initialState.pagers, action) {
    switch (action.type) {
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                [action.pagerName]: Object.assign({}, state[action.pagerName], { currentPage: (action.page || action.currentPage) || 1 })
            });
        }
        case actionTypes.SET_PAGE_SIZE: {
            return Object.assign({}, state, {
                [action.pagerName]: Object.assign({}, state[action.pagerName], { pageSize: action.pageSize || 1 })
            });
        }
        case actionTypes.SET_ITEM_COUNT: {
            return Object.assign({}, state, {
                [action.pagerName]: Object.assign({}, state[action.pagerName], { itemCount: action.itemCount || 0 })
            });
        }
        case actionTypes.SET_SORT_BY: {
            return Object.assign({}, state, {
                [action.pagerName]: Object.assign({}, state[action.pagerName], { sortBy: action.sortBy })
            });
        }
        case actionTypes.SET_FILTER_BY: {
            return Object.assign({}, state, {
                [action.pagerName]: Object.assign({}, state[action.pagerName], { filterBy: action.filterBy, currentPage: 1 })
            });
        }               
        case actionTypes.CREATE_PAGER: {
            return Object.assign({}, state, {
                [action.pagerName]: createPager(action.pagerName, 
                                                action.currentPage || action.page, 
                                                action.pageSize, 
                                                action.itemCount, 
                                                action.sortBy, 
                                                action.filterBy)
            });
        }
        case actionTypes.UPDATE_PAGER: {
            return Object.assign({}, state, {
                [action.pagerName]: createPager(action.pagerName, 
                                                action.currentPage || action.page, 
                                                action.pageSize, 
                                                action.itemCount, 
                                                action.sortBy, 
                                                action.filterBy)
            });
        }
        case actionTypes.REMOVE_PAGER: {
            const pagers = state;
            delete pagers[action.pagerName];
            return Object.assign({}, pagers);
        }
        default:
            return state;
    }
}
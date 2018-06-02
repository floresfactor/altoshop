import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function ajaxStatusReducer(state = initialState.accounts, action) {
    switch (action.type) {
        case actionTypes.LOAD_ACCOUNTS_SUCCESS: {
            return action.accountsList;
        }
        case actionTypes.TOGGLE_ADMIN_ACCOUNT_SUCCESS: {
            const toggledAccount = action.toggledAccount; 
            return [...state.filter(account => account._id !== toggledAccount._id), toggledAccount ]
        }
        default:
            return state;
    }
}
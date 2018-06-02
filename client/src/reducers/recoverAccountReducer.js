import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function RecoverAccountReducer(state = initialState.recoverAccount, action) {
    switch (action.type) {
        case actionTypes.RECOVERY_ACCOUNT_SUCCESS: {
            return action.recoverAccount;
        }
        case actionTypes.CHANGE_PASSWORD_SUCCESS: {
            return action.changePassword;
        }
        default:
            return state;
    }
}
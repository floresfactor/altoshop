import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function ajaxStatusReducer(state = initialState.account, action) {
  switch (action.type) {
    case actionTypes.ACCOUNT_LOGIN_SUCCESS:
      {
        return {
          token: action.token,
          isAdmin: action.isAdmin,
          isComplete: action.isComplete,
          email: action.email,
	        customer: action.customer,
          isLoggedIn: true,
        };
      }
    case actionTypes.ACCOUNT_LOGOUT_SUCCESS:
      {
        return {
          token: null,
          isAdmin: false,
          isComplete: false,
          email: null,
	        customer: null,
          isLoggedIn: false,
        };
      }

    case actionTypes.SET_GUEST_ACCOUNT_SUCCESS:
      {
        return {
          ...action.token
        };
      }
    default:
      return state;
  }
}

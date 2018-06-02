import moment from 'moment';
import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function ajaxStatusReducer(state = initialState.attempts, action) {
	switch(action.type) {
		case actionTypes.ATTEMPTS_FAIL:
		  {
			return {
			  count: state.count + 1 ,
			  limit: action.limit,
			  customExpiresAt: moment().add(20, 'm').format(),
			};
		  }
		case actionTypes.ATTEMPTS_FAIL_FULL:
		  {
			return {
				count: action.limit,
				limit: action.limit,
				customExpiresAt: moment().add(20, 'm').format(),
			};
	      }
		default: return state;
	}
}
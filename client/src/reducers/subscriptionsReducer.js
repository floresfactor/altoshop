import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function subscriptionsReducer(state = initialState.subscription, action){
  switch(action.type){
    case actionTypes.ADD_SUBSCRIPTION_SUCCESS: {
        return action.subscription
    }
    default:
      return state;
  }
}
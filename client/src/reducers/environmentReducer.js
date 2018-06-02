import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function environment(state = initialState.environment, action){
  switch (action.type) {
    case actionTypes.WINDOW_RESIZE:
      return {
        ...state,
        height: action.height,
        width: action.width,
      };

    default:
      return state;
  }
}

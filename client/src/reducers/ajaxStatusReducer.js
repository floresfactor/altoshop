import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

let dispatchersCallingAjax = [];

export default function ajaxStatusReducer(state = initialState.ajaxCallsInProgress, action) {
    switch (action.type) {
        case actionTypes.BEGIN_AJAX_CALL: {                
            dispatchersCallingAjax.push(action.dispatcher);
            return [...dispatchersCallingAjax];
        }
        case actionTypes.END_AJAX_CALL: {
            const endingDispatcherIndex = dispatchersCallingAjax.findIndex(dispatcher => dispatcher == action.dispatcher);
            dispatchersCallingAjax.splice(endingDispatcherIndex, 1);
            return [...dispatchersCallingAjax];
        }
        default:
            return state;
    }
}
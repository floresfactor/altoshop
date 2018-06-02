import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function sidebarReducer(state = initialState.sidebarComponent, action) {
    switch (action.type) {
        case actionTypes.SET_SIDEBAR_COMPONENT: {
            return action.sidebarComponent;
        }
        default:
            return state;
    }
}
import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function UICascaderInputReducer(state = initialState.UICascaderInput, action) {
    switch (action.type) {
        case actionTypes.SET_UI_CASCADER_INPUT_SEARCH: {
            return Object.assign({}, state, { search: action.search || '' });
        }
        default:
            return state;
    }
}
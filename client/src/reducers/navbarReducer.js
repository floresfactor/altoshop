import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

// See:
// navComponents: PropTypes.shape({
//     right: PropTypes.shape({
//         Component: PropTypes.func,
//         componentData: PropTypes.object,
//     }),
//     left: PropTypes.shape({
//         Component: PropTypes.func,
//         componentData: PropTypes.object,
//     })
// })

export default function navbarReducer(state = initialState.navComponents, action) {
    switch (action.type) {
        case actionTypes.SET_NAV_RIGHT_COMPONENT: {
            return Object.assign({},
                        (action.navComponentData ? { right: Object.assign({}, action.navComponentData) } : null),
                        (state.left ? { left: Object.assign({}, state.left) } : null))
        }
        case actionTypes.SET_NAV_LEFT_COMPONENT: {
            return Object.assign({},
                        (state.right ? { right: Object.assign({}, state.right) } : null),
                        (action.navComponentData ? { left: Object.assign({}, action.navComponentData) } : null));
        }
        default:
            return state || {};
    }
}
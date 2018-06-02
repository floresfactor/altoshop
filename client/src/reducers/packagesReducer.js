import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';


export default function ProductsReducer(state = initialState.packages, action) {
    switch (action.type) {
        case actionTypes.LOAD_PACKAGES_SUCCESS: {
            return action.packages;
        }
        case actionTypes.ADD_PACKAGE_SUCCESS: {
            return [action.savedPackage, ...state];
        }
        case actionTypes.PATCH_PACKAGE_SUCCESS: {
            return [...state.map(p => p._id != action.patchedPackage._id ?
                p : Object.assign({}, action.patchedPackage)
            )];
        }
        case actionTypes.DELETE_PACKAGE_SUCCESS: {
            return [...state.filter(_package => _package._id != action.packageID)];
        }
        case actionTypes.DELETE_PACKAGE_IMAGE_SUCCESS:
        case actionTypes.UPLOAD_PACKAGE_IMAGE_SUCCESS: {
            const { image, packageID } = action;
            return [...state.map(_package => _package._id == packageID ?
                Object.assign({}, _package, { image }) : _package
            )];
        }
        case actionTypes.SET_PACKAGE_PROPERTIES: {
            const { packageID, props } = action;
            return [...state.map(_package => _package._id == packageID ?
                Object.assign({}, _package, Object.assign({}, props)) : _package
            )];
        }
        default: return state;
    }
}
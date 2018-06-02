// There are times we need to have object data on store
// that is not necessarilly related to another store collection
// or is not "important" enough as to have a separate store property
// so we can use this variableObject
// 
// Use wiselly: clear data when done using.

import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';
import VariableObjectTypes from '../lib/constants/variableObjectTypes';

export default function variableObjectReducer(state = initialState.variableObject, action) {
    switch (action.type) {
        case actionTypes.GET_PRODUCT_GROUP_SUCCESS: {
            return Object.assign({}, action.productGroup, { variableObjectType: VariableObjectTypes.PRODUCT_GROUP });
        }
        case actionTypes.GET_DISPLAY_ITEM_SUCCESS: {
            return Object.assign({}, action.displayItem, { variableObjectType: VariableObjectTypes.DISPLAY_ITEM });
        }
        case actionTypes.GET_DISCOUNT_SUCCESS: {
            return Object.assign({}, action.discount, { variableObjectType: VariableObjectTypes.DISCOUNT });
        }
        case actionTypes.GET_ADMIN_ORDER_SUCCESS: {
            return Object.assign({}, action.order, { variableObjectType: VariableObjectTypes.ADMIN_ORDER });
        }        
        case actionTypes.GET_CUSTOMER_ORDER_SUCCESS: {
            return Object.assign({}, action.order, { variableObjectType: VariableObjectTypes.CUSTOMER_ORDER });
        }
        case actionTypes.GET_APP_SETTINGS_SUCCESS: {
            return Object.assign({}, { appSettings: action.appSettings }, { variableObjectType: VariableObjectTypes.APP_SETTINGS });
        }        
        case actionTypes.SET_APP_SETTINGS_SUCCESS: {
            return Object.assign({}, 
                { appSettings: Object.assign({}, state.appSettings, action.newSettingObj) },
                { variableObjectType: VariableObjectTypes.APP_SETTINGS });
        }               
        case actionTypes.SET_VARIABLE_OBJECT_ON_STORE: {
            return Object.assign({}, action.obj, { variableObjectType: action.variableObjectType });
        }
        case actionTypes.CLEAR_VARIABLE_OBJECT_DATA: {            
            return { variableObjectType: null };
        }
        case actionTypes.GET_PACKAGE_SUCCESS: {
            return Object.assign({}, action._package, { variableObjectType: VariableObjectTypes.ADMIN_PACKAGE });
        }
        default:
            return state;
    }
}
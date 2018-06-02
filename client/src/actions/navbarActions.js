import actionTypes from './actionTypes';

export function setNavRightComponent(navComponentData) {
    return { type: actionTypes.SET_NAV_RIGHT_COMPONENT, navComponentData };
}

export function setNavLeftComponent(navComponentData) {
    return { type: actionTypes.SET_NAV_LEFT_COMPONENT, navComponentData };
}
import actionTypes from './actionTypes';

export function setSidebarComponent(sidebarComponent) {
    return { type: actionTypes.SET_SIDEBAR_COMPONENT, sidebarComponent };
}
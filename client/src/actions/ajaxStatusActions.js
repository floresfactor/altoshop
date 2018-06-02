import actionTypes from './actionTypes';

export function beginAjaxCall(dispatcher) {
    if (!dispatcher)
        console.error('No dispatcher received on action BEGIN_AJAX_CALL');

    return { type: actionTypes.BEGIN_AJAX_CALL, dispatcher };
}

export function endAjaxCall(dispatcher) {
    if (!dispatcher)
        console.error('No dispatcher received on action BEGIN_AJAX_CALL');

    return { type: actionTypes.END_AJAX_CALL, dispatcher };
}
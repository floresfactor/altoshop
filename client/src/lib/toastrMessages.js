import toastr from 'toastr';

export function toastrError(serverError) {
    if (serverError.response) {
        toastr.error(serverError.response.message || serverError.response.statusText, serverError.message);
    } else {
        toastr.error(serverError.message, 'Error!');
    }
}

export function toastrSuccessBottomRight(message, title) {
    toastr.success(message || 'Ok', title, { positionClass: 'toast-bottom-right', timeOut: 1000 });
}

export function toastrWarn(warning) {
    toastr.warning(warning.message);
}
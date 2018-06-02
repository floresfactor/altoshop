export const ValidationErrors = {
    required: "Este campo es requerido",
    isDefaultRequiredValue: "Este campo es requerido",
    isEmail: "Correo no válido",
    isInt: "Tiene que se un número entero",
    isNumeric: "Debe ser un número",
    positiveNumber: "Tiene que ser mayor que 0",
    minLength(key, value) {
        return 'Mínimo ' + value + ' caracteres';
    },
    passwordsDontMatch: 'Las contraseñas no coinciden',
    invalidPhone: 'Introduzca un número telefónico válido',
    invalidCard: 'Número de tarjeta invalido',
    invalidCVC: 'Campo no válido',
    matchRegexp: 'Campo no válido'
};

export const validationRegexs = {
    phone: /\+52\s\([0-9]{3}\)\s[0-9]{3}-[0-9]{2}-[0-9]{2}/,
    card: /^\d{4}[\s\-]*\d{4}[\s\-]*\d{4}[\s\-]*\d{4}$/,
    cvc: /\d{3}/,
    name: /^[a-zA-ZñÑ]+(\s(?!(\s|$))[a-zA-ZñÑ]*)*$/,
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
};

export const masks = {
    MXPhone: '+52 (999) 999-99-99',
    card: '9999-9999-9999-9999',
    cvc: '999'
}

export const ValidationFunctions = {
    positiveNumber(values, value) {
        // We return true for isNaN cuz this must be validated somewhere else
        // i.e. this validation doesn't do anything for undefined/string values
        return value === '' || isNaN(value) || value > 0;
    }
};

export function containsValidationErrors(error) {
    return error.response && error.response.status.toString().charAt(0) == 4 && error.response.data && error.response.data.errors;
}

// The function takes a mongoose-like errors.error (such as:
// errObj = {
//      prop1: { message: 'error message1', path: 'yy' ... },
//      prop2: { message: 'error message2', path: 'yy' ... }
// }
// ) and returns the mapping in the form of: 
//  {
//      prop1: 'error message1',
//      prop2: 'error message2' 
//  }
export function mapErrors(errObj) {
    let retVal = {};

    Object.keys(errObj).forEach(prop => {
        retVal[prop] = errObj[prop].message;
    });

    return retVal;
}
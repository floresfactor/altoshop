// Generates a mongoose-like error
//
// Errors in the form of: 
//   ArrayOf({
//       propertyName: 'x',
//       message: 'x is not right'
//   })
//
// TODO: Generate more than 1 error per property ?
const buildErrorObject = (errorsArr, errorObj, errorName) => {
  errorsArr.forEach(e => {
    if (!errorObj.errors[e.propertyName]) {
      errorObj.errors[e.propertyName] = {
        message: e.message,
        name: errorName || 'ERROR',
      };
    }
  });

  return errorObj;
};

// Generates a mongoose-like validation error object
// prototypically inheriting from javascript native Error object
function NativeValidationError(message, errorsArr) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.error = buildErrorObject(errorsArr, { errors: {} }, 'validationError');
  this.status = 400;
}

NativeValidationError.prototype = Object.create(Error.prototype);
NativeValidationError.prototype.constructor = NativeValidationError;

// Generates a not-found error prototypically inheriting from javascript native Error object
function NativeNotFoundError(message) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.status = 404;
}
NativeNotFoundError.prototype = Object.create(Error.prototype);
NativeNotFoundError.prototype.constructor = NativeNotFoundError;

module.exports = {
  generateValidationErrors(errorsArr) {
    return buildErrorObject(errorsArr, { errors: {}, status: 400 }, 'validationError');
  },
  generateAuthErrors(errorsArr) {
    return buildErrorObject(errorsArr, { errors: {}, status: 401 }, 'authenticationError');
  },
  generateNotFoundError(message) {
    return {
      message,
      status: 404,
    };
  },
  generateCustomError(message, status) { // ...mmm?
    return { message, status };
  },
  // Generates 400 errors inheriting from js Error object (use for mongoose middleware)
  generateValidationNativeError(message, errorsArr) {
    return new NativeValidationError(message, errorsArr);
  },
  // Generates 404 errors inheriting from js Error object (use for mongoose middleware)
  generateNotFoundNativeError(message) {
    return new NativeNotFoundError(message);
  },
};

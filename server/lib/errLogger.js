const ErrLog = require('../models/errLog');

module.exports = function (err = {}, req = {}) {
  const stackTrace = err.stack || 'Stack not found.';
  const message = (typeof err === 'string') ? err : err.message;

  // is possible that one of reqest props cause an error when try
  // to save the document (circular object structure or somting like that) when
  // mongoose parse the js object into a mongo object
  // todo: check if some request property can cause this possible  error
  const request = {
    authErrors: req.authErrors, // Does is it necesary?
    body: req.body,
    cookies: req.cookies, // Does is it necesary?
    headers: req.headers,
    host: req.host,
    ip: req.ip,
    ips: req.ips,
    method: req.method,
    params: req.params,
    protocol: req.protocol,
    query: req.query,
    url: req.url,
    user: req.user,
  };
  const error = {
    message: err.message,
    stack: err.stack,
    messages: err.messages, // maybe this unhandled error will never have messages prop
  };

  if (err.details && Array.isArray(err.details)) {
    error.details = [];
    err.details.map(detail => {
      error.details.push(detail);
    });
  }

  let errLog = {
    error,
    message,
    request,
    stackTrace,
  };

  let errLogDoc = new ErrLog(errLog);

  return errLogDoc.save().catch((e = {}) => { // this has a .then() where res is sent, so res.send don't waith for errLogDoc save of this line
    // this catch is to know if one req prop or err shape causes an error
    // i decide to check any posible error right here cuz  check the errors can slow the res.send
    // i think is better do this asynchronously from the res.send func.

    // todo: test each req prop to know which one throws an error when trying stringify
    // check too err.messages array, each array element must be a string
    // and log in db which properties caused those errors.

    errLog = {};

    // new error info
    errLog.message = "couldn't save the errLog.";
    errLog.stackTrace = e.stack;

    // old error info, now in a secure way, this props shouldn't cause an error in db
    // (a programer can send an bad error shape, i.e an unparseable mongo object in some err prop)
    errLog.error = {
      message: (typeof err.message === 'string' || err.message == null) ? err.message : `got an: ${typeof err.message} need a string.`,
      stack: (typeof err.stack === 'string' || err.stack == null) ? err.stack : `got an: ${typeof err.stack} need a string.`,
    };

    // this props must come whitout errors, req is sent by global err middleware, not by a programmer
    errLog.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      ips: req.ips,
    };

    errLogDoc = new ErrLog(errLog);

    errLogDoc.save().catch(err => { // todo: delete this catch when decide if the ips req property must be deleted and tested
      errLog = {};

      errLog.message = "couldn't save the secure errLog.";
      errLog.stackTrace = err.stack;

      errLog.error = {
        message: (typeof err.message === 'string' || err.message == null) ? err.message : `got an: ${typeof err.message} need a string.`,
        stack: (typeof err.stack === 'string' || err.stack == null) ? err.stack : `got an: ${typeof err.stack} need a string.`,
      };

      errLogDoc = new ErrLog(errLog);

      errLogDoc.save();// last try of save an errLog
    });
  });
};

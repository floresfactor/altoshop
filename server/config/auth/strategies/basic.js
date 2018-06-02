const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const {
  ExtractJwt,
} = require('passport-jwt');
const jwt = require('jsonwebtoken');
const FacebookStrategy = require('passport-facebook-token');
const GoogleStrategy = require('passport-google-plus-token');
const ExpressLimit = require('express-rate-limit');
const Account = require('../../../models/account');
const GenerateAuthErrors = require('../../../lib/generateErrors')
  .generateAuthErrors;
const constants = require('../../../lib/constants/resources');

const LoginRateLimit = new ExpressLimit({
  windowMs: 20*60*1000, // 20 minutes
  max: 6, // limit each IP to 6 requests per windowMs
  delayMs: 0,
  message: "You try to login many times, please try again after 20 min"
});

const ResetAccountLimit = new ExpressLimit({
  windowMs: 30*60*1000, // 30 minutes
  max:10, // limit each IP 10 request per windowMs
  delayMs:0,
  message: "You try to reset you password many times, please try again after 30 min"
})
const SignUpRateLimit= new ExpressLimit({
  windowMs: 60*60*1000, // 60 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  delayMs: 0,
  message: "Too many accounts created from this IP, please try again after an hour"
})
const localOpts = {
  usernameField: 'email',
};
// Local strategy
const localStrategy = new LocalStrategy(
  localOpts,
  async (email, password, done) => {
    try {
      const account = await Account.findOne({ email });
      if (!account) {
        return done(null, false);
      }
      const match = await account.authenticateUser(password);
      if (!match) {
        return done(null, false);
      }
      return done(null, account);
    } catch (e) {
      return done(e, false);
    }
  }
);

// Admin middleware

const adminRequire = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = await jwt.verify(token, constants.JWT_SECRET);
    const {
      id,
    } = verify;
    const account = await Account.findById(id);
    if (!account) {
      return res.status(400).send('User not exists');
    }
    if (!account.isAdmin) {
      console.log('you not at admin');
      return res.status(401).send('not admin');
    }
    return next();
  } catch (e) {
    // statements
    next(e, false);
  }
};

// JWT strategy
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: constants.JWT_SECRET,
};

const jwtStrategy = new JWTStrategy(jwtOpts, async (jwtPayload, done) => {
  try {
    const account = await Account.findById(jwtPayload.id);
    if (!account) {
      return done(null, false);
    }
    return done(null, account);
  } catch (e) {
    return done(e, false);
  }
});

// GOOGLE strategy
passport.use('googleToken',
  new GoogleStrategy({
    clientID: constants.GOOGLE_KEYS.clientId,
    clientSecret: constants.GOOGLE_KEYS.clientSecretKey,
    // callbackURL: constants.GOOGLE_KEYS.callbackURL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingAccount = await Account.findOne({ email: profile.emails[0].value });
      if (existingAccount) {
        console.log('Account already exists in DB');
        return done(null, existingAccount);
      }
      console.log('Account doesn\'t exists, we\'re creating a new one');
      const newAccount = new Account({
        method: 'google',
        providerId: profile.id,
        email: profile.emails[0].value,
        password: accessToken,
      });

      await newAccount.save();
      done(null, newAccount);
    } catch (error) {
      done(error, false, error.message);
    }
  }
  )
);
// newworldcorporationuio@gmail.com
// FACEBOOK strategy
passport.use('facebookToken',
  new FacebookStrategy({
    clientID: constants.FACEBOOK_KEYS.clientID,
    clientSecret: constants.FACEBOOK_KEYS.clientSecret,
    // callbackURL: constants.FACEBOOK_KEYS.callbackURL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile);
      console.log(accessToken);
      const existingAccount = await Account.findOne({ email: profile.emails[0].value });
      if (existingAccount) {
        console.log('Account already exists in DB');
        return done(null, existingAccount);
      }
      console.log('Account doesn\'t exists, we\'re creating a new one');
      const newFacebookAccount = new Account({
        method: 'facebook',
        providerId: profile.id,
        email: profile.emails[0].value,
        password: accessToken,
      });
      await newFacebookAccount.save();
      done(null, newFacebookAccount);
    } catch (error) {
      done(error, false);
    }
  }
  )
);

passport.use(localStrategy);
// passport.use(AdminlocalStrategy);
passport.use(jwtStrategy);
const authGoogle = passport.authenticate('googleToken', {
  session: false,
});
const authFacebook = passport.authenticate('facebookToken', {
  session: false,
});
const authLocal = passport.authenticate('local', {
  session: false,
});
const authJwt = passport.authenticate('jwt', {
  session: false,
});

// Authenticates a user and generates a new session token
const authenticateAndGenerateSessionCallback = (
  req,
  email,
  password,
  callback
) => {
  Account.findOne({
    email,
  }, (err, account) => {
    if (err) {
      return callback(err);
    }

    // No user found with that username/email
    if (!account) {
      // Return errors to middleware pipe
      return callback(
        GenerateAuthErrors([{
          message: 'email not found',
          propertyName: 'email',
        }])
      );
    }

    // Make sure the password is correct, this generates a new session ID
    account.basicAuthenticateAndGenerateSession(
      password,
      (err, isMatch, updatedAccount) => {
        if (err) {
          return callback(err);
        }

        // Password did not match
        if (!isMatch) {
          return callback(
            GenerateAuthErrors([{
              propertyName: 'password',
              message: 'Password is incorrect',
            }])
          );
        }
        // Success
        return callback(null, updatedAccount);
      }
    );
  });
};

const authenticateCallback = (req, email, sessionID, callback) => {
  Account.findOne({
    email,
  }, (err, account) => {
    if (err) {
      return callback(err);
    }

    // No user found with that username/email
    if (!account) {
      // Return errors to middleware pipe
      return callback(
        GenerateAuthErrors([{
          message: 'email not found',
          propertyName: 'email',
        }])
      );
    }

    // Make sure the sessionID is correct
    account.basicAuthenticate(sessionID, (err, isAuthenticated) => {
      if (err) {
        return callback(err);
      }

      // Password did not match
      if (!isAuthenticated) {
        const errors = [];
        errors.push({
          propertyName: 'sessionID',
          message: 'Invalid token or session expired',
        });
        errors.push({
          propertyName: 'sessionExpirationDate',
          message: 'Invalid token or session expired',
        });

        return callback(GenerateAuthErrors(errors));
      }
      // Success
      return callback(null, account);
    });
  });
};

const adminAuthenticateCallback = (req, email, sessionID, callback) => {
  Account.findOne({
    email,
  }, (err, account) => {
    if (err) {
      return callback(err);
    }

    // No user found with that username/email
    if (!account) {
      // Return errors to middleware pipe
      return callback(
        GenerateAuthErrors([{
          message: 'email not found',
          propertyName: 'email',
        }])
      );
    }

    // Make sure the password is correct, this generates a new session ID if it is and the previous session hasn't expired
    account.basicAuthenticate(sessionID, (err, isAuthenticated) => {
      if (err) {
        return callback(err);
      }

      const errors = [];

      // Password did not match
      if (!isAuthenticated) {
        errors.push({
          propertyName: 'sessionID',
          message: 'Invalid token or session expired',
        });
        errors.push({
          propertyName: 'sessionExpirationDate',
          message: 'Invalid token or session expired',
        });

        return callback(GenerateAuthErrors(errors));
      }
      // Check user is admin
      if (!account.isAdmin()) {
        errors.push({
          propertyName: 'AccountRoles',
          message: 'Not an admin',
        });
      }

      return errors.length ?
        callback(GenerateAuthErrors(errors)) :
        callback(null, account);
    });
  });
};

// Runs before authentication
// 1. Extract auth information from request headers/body for passport middleware
const beforeAuth = (req, res, next) => {
  // Stores auth errors (as missing data)
  const errsArr = [];

  // Basic authentication
  if (req.headers.authorization) {
    // TODO: make this robust enough as to remove the try/catch
    try {
      const buf = Buffer.from(
        req.headers.authorization.split(' ')[1],
        'base64'
      ).toString();
      const email = buf.split(':')[0];
      const sessionID = buf.split(':')[1]; // <-- One or the other with password will be actually used, depending on the endpoint
      const password = buf.split(':')[1]; // <-- One or the other with sessionID will be actually used, depending on the endpoint

      // Store auth info in the request for passtport-local use
      // GET/DELETE requests store auth info in query, other methods in body
      if (req.method === 'GET') {
        req.query.email = email;
        req.query.sessionID = sessionID;
        req.query.password = password;
      } else {
        const {
          account,
        } = req.body;

        // Receiving account object in body?
        if (account) {
          req.body.email = account.email;
          req.body.sessionID = account.sessionID;
          req.body.password = account.password;
        } else {
          // From headers?
          req.body.email = email;
          req.body.sessionID = sessionID;
          req.body.password = password;
        }
      }
    } catch (e) {
      errsArr.push([{
        message: 'unknown error / bad formatted auth data',
        propertyName: '_',
      }]);
    }
  } else {
    // Look for auth info in req.body.account
    const {
      account,
    } = req.body;

    if (account) {
      req.body.email = account.email;
      req.body.sessionID = account.sessionID;
      req.body.password = account.password;
    }
  }

  if (!(req.body.email && req.body.password) ||
    !(req.query.email && req.query.password)
  ) {
    ['email', 'password'].forEach(prop => {
      if (!(req.body[prop] || req.query[prop])) {
        errsArr.push({
          message: `${prop} not provided`,
          propertyName: prop,
        });
      }
    });
  }

  if (errsArr.length) {
    return GenerateAuthErrors(errsArr);
  }
};

// Runs after authentication
// 1. Clean request from auth data placed in to authenticate
// 2. Check if there were any error, if so, redirect to handlers
const afterAuth = (errs, req, res, next, continueMiddlewareOnAuthFail) => {
  // Clean request
  delete req.body.email;
  delete req.body.password;
  delete req.body.sessionID;
  delete req.query.email;
  delete req.query.password;
  delete req.query.sessionID;

  // Delegate to error handlers or continue middleware chain
  if (errs && !(continueMiddlewareOnAuthFail === true)) {
    next(errs);
  } else {
    req.authErrors = errs;
    next();
  }
};

module.exports = {
  // Sets password auth passport configuration
  adminRequire,
  authLocal,
  authJwt,
  authFacebook,
  authGoogle,
  LoginRateLimit,
  SignUpRateLimit,
  ResetAccountLimit,
  Configure() {
    // Use to authenticate AND generate new session
    passport.use(
      'login-basic',
      new LocalStrategy({
        session: false,
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password',
      },
      authenticateAndGenerateSessionCallback
      )
    );

    // Use to authenticate
    passport.use(
      'authenticate-basic',
      new LocalStrategy({
        session: false,
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password',
      },
      authenticateCallback
      )
    );

    // Use to authenticate ADMIN users
    passport.use(
      'admin-authenticate-basic',
      new LocalStrategy({
        session: false,
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password',
      },
      adminAuthenticateCallback
      )
    );
  },

  // **********************************
  //  Middleware to use in controllers
  // **********************************

  // Run callbacks registered on Configure functions by their name i.e. 'login-basic' and 'authenticate-basic'
  loginBasic(continueMiddlewareOnAuthFail) {
    return function (req, res, next) {
      // Extract auth data from request
      const authErrors = beforeAuth(req, res, next);

      if (authErrors) {
        // Clean request and continue middleware chain
        if (continueMiddlewareOnAuthFail) {
          return afterAuth(authErrors, req, res, next, true);
        } // Delegate to error handlers
        return next(authErrors);
      } // Go to passport middleware
      // Logs in generating new session data
      return passport.authenticate('login-basic', {
        session: false,
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password',
      })(req, res, err =>
        afterAuth(err, req, res, next, continueMiddlewareOnAuthFail)
      );
    };
  },

  authenticateBasic(continueMiddlewareOnAuthFail = false, redirect = true) {
    return function (req, res, next) {
      // Redirect to login if there is an auth error for this middleware
      if (redirect) {
        req.onErrorRedirect = req.onErrorRedirect || '/account/login';
      }

      // Extract auth data from request
      const authErrors = beforeAuth(req, res, next);

      if (authErrors) {
        // Clean request and continue middleware chain
        if (continueMiddlewareOnAuthFail) {
          return afterAuth(authErrors, req, res, next, true);
        } // Delegate to error handlers
        return next(authErrors);
      }
      // Authenticates the request based on the received session data
      return passport.authenticate('authenticate-basic', {
        session: false,
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'sessionID',
      })(req, res, err =>
        afterAuth(err, req, res, next, continueMiddlewareOnAuthFail)
      );
    };
  },

  adminAuthenticateBasic(
    continueMiddlewareOnAuthFail = false,
    redirect = true
  ) {
    return function (req, res, next) {
      // Redirect to login if there is an auth error for this middleware
      if (redirect) {
        req.onErrorRedirect = req.onErrorRedirect || '/account/login';
      }

      // Extract auth data from request
      const authErrors = beforeAuth(req, res, next);

      if (authErrors) {
        // Clean request and continue middleware chain
        if (continueMiddlewareOnAuthFail) {
          return afterAuth(authErrors, req, res, next, true);
        } // Delegate to error handlers
        return next(authErrors);
      }
      // Authenticates the request based on the received session data
      return passport.authenticate('admin-authenticate-basic', {
        session: false,
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'sessionID',
      })(req, res, err =>
        afterAuth(err, req, res, next, continueMiddlewareOnAuthFail)
      );
    };
  },
};

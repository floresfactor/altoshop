const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const appSettings = require('../../settings').appSettings;
const folderSettings = require('../../settings').folderSettings;

// Serve server static files
const serveStatic = app => {
  app.use(express.static(folderSettings.PUBLIC_STATICS_FOLDER));
};

// Configure parsers/serializers
const configureParsers = app => {
  app.use(bodyParser.urlencoded({ extended: true })); // <-- QueryStrings
  app.use(bodyParser.json()); // <-- json
  app.use(cookieParser());
  app.use(morgan('dev'));
};

// CORS configuration for served apps
const configureCors = app => {
  const whiteList = appSettings.ALLOWED_CORS_ORIGINS;

  const options = {
    origin: (origin, callback) => {
      if (whiteList.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
  };

  // Allowing alll!!!!!!!!!!! for testing purposes
  // app.use(cors(options)); <-- This is the one we want later
  app.use(cors());
};

module.exports = function configureMiddleware(app) {
  serveStatic(app);
  configureParsers(app);
  configureCors(app);
};

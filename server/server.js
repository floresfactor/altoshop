/* eslint-disable no-console */

const express = require('express');
const https = require('https');
const mongoose = require('mongoose');
const configureServerApp = require('./config');
const appSettings = require('./settings').appSettings;
const chalk = require('chalk');

const app = express();
const fs = require('fs');

let retryCount = 0;
connect();

// Initialize and configure server app
configureServerApp(app);

// Starts express server
let server;
const listen = () => {
    const port = process.env.port || appSettings.APP_PORT;
    const isHttps = process.env.HTTPS === 'true';

    if(isHttps) {
        const key = fs.readFileSync('cert/private.key');
        const cert = fs.readFileSync('cert/primary.crt');
        const ca = fs.readFileSync('cert/intermediate.crt');

        const options = {
            key: key,
            cert: cert,
            ca: ca
        };

        server = https.createServer(options, app).listen(port);
    } else {
        server = app.listen(port);
    }

    console.log(chalk.bgMagenta('Server listening on port ' + server.address().port + '....\n'));
};

function connect() {
  let connString =
    'mongodb://' +
    appSettings.DB.host +
    ':' +
    appSettings.DB.port +
    '/' +
    appSettings.DB.database;
  const options = {
    server: { socketOptions: { keepAlive: 1 } },
    user: appSettings.DB.user,
    pass: appSettings.DB.pass,
  };

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'staging' &&
    retryCount >= 3
  ) {
    connString =
      'mongodb://' +
      appSettings.FALLBACK_MONGO_DB_HOST +
      ':' +
      appSettings.FALLBACK_MONGO_DB_PORT +
      '/' +
      appSettings.FALLBACK_MONGO_DB_DB_NAME;
    if (
      appSettings.FALLBACK_MONGO_DB_AUTH === true ||
      (appSettings.FALLBACK_MONGO_DB_AUTH === 'true' && 1 === 2)
    ) {
      options.user = appSettings.FALLBACK_MONGO_DB_DB_USER;
      options.pass = appSettings.FALLBACK_MONGO_DB_DB_PASS;
    }
    console.log('Local db not found, switching to remote mongoDB instance...');
  }

  console.log('Connecting to mongo with connection string: ' + connString);
  console.log(
    'MongoDB auth is: ' +
      (options.user && options.pass ? 'ENABLED' : 'DISABLED')
  );

  return mongoose.connect(connString, options).catch(err => {
    retryCount++;
    if (retryCount >= 3)
      {console.error("Failed to connect to mongo, ERROR!!:", err);}
  });
}

mongoose.connection
  .on('disconnected', () => {
    // Wait and try to connect again
    setTimeout(connect, 2000);
  })
  .once('open', () => {
    // Start server when db is ready
    console.log('Connection READY!');
    listen();
    console.log('Server @: ' + appSettings.SERVER_ADDRESS);
  });

module.exports = app; //this for testing

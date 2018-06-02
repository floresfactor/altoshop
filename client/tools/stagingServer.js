// This file configures a web server for testing the production build
// on your local machine.

const browserSync = require('browser-sync');
const historyApiFallback = require('connect-history-api-fallback');
const chalkProcessing = require('chalk').blue;

/* eslint-disable no-console */

console.log(chalkProcessing('Opening staging build...'));
console.log(chalkProcessing('BrowserSync @ ' + process.env.port));

// Run Browsersync
browserSync({
  port: process.env.port || 4000,
  ui: {
    port: Number(process.env.port || 4000) + 1
  },
  server: {
    baseDir: 'staging'
  },

  files: [
    'src/*.html'
  ],

  middleware: [historyApiFallback()]
});
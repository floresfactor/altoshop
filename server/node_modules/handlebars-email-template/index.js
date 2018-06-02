'use strict';
var handlebars = require('handlebars');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');
var objectAssign = require('object-assign');
var glob = require('glob-fs')({ gitignore: true });

function handlebarsEmailTemplate(options) {
  var template; // Where we compile the email.html page.

  var defaults = {
    root: 'views',
    src: '_partials',
    dest: 'compiled',
    srcTemplate: 'email',
    destTemplate: 'email',
    ext: 'hbs',
    data: 'data/data.json'
  };

  var config = objectAssign(defaults, options);

  function handleError(error) {
    console.error(error.stack);
  }

  function createTemplate(html) {

      fs.outputFileAsync(path.resolve(config.dest , config.destTemplate + '.html'), html)
      .then(outputResultMessage)
      .catch(handleError);

      return;
  }

  function compileTemplate(hbs) {
      var data = require(path.resolve(defaults.data));

      template = handlebars.compile(hbs)(data);

      return template;
  }

  function setupTemplate() {
    fs.readFileAsync(path.resolve(config.root , config.srcTemplate + '.' + config.ext), 'utf8')
    .then(compileTemplate)
    .then(createTemplate)
    .catch(handleError);

    return;
  }

  function registerPartial(partialObj) {

    var startPath = partialObj.partialName.indexOf(config.src) + (config.src.length + 1);
    var endPath = partialObj.partialName.length;

    partialObj.partialName = partialObj.partialName.substr(startPath, endPath).replace(config.src, '');

    partialObj.partialName = partialObj.partialName.replace(options.src, '').replace('.' + options.ext, '');

    handlebars.registerPartial(partialObj.partialName, partialObj.contents);
  }

  function getPartialContents(partialPath) {
    fs.readFileAsync(partialPath, 'utf8')
    .then(function passDownPartialPath(contents) {
        registerPartial({
          partialName: partialPath,
          contents: contents
        });

        return;
    })
    .catch(handleError);
  }

  function outputResultMessage() {
    console.log(config.destTemplate + '.html Generated');

    return;
  }

  function readPartialDirectory(filePathArr) {
    var partialPromises = filePathArr.map(getPartialContents);

    return Promise.all(partialPromises);

  }
  // Get an array of partials from the partials directory by reading for every hbs file.
  function init() {

    var directory = path.resolve(config.root, config.src, '**/*.hbs');
    var startIndex = directory.indexOf(config.root);

    directory = directory.substr(startIndex, directory.length);

    glob.readdirPromise(directory)
    .then(readPartialDirectory)
    .then(setupTemplate)
    .catch(handleError);
  }

  init();

}

module.exports = handlebarsEmailTemplate;

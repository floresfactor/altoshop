/* global describe, it */

var should = require('should');
var handlebarsEmailTemplate = require('../index');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');

var options = {
  root: 'views',
  src: '_partials',
  dest: 'test/testData/generated',
  srcTemplate: 'email',
  destTemplate: 'test',
  ext: 'hbs'
};

var optionsTwo = {
  root: 'views',
  src: '_partials',
  dest: 'test/testData/generatedTwo',
  srcTemplate: 'email',
  destTemplate: 'test',
  ext: 'hbs'
};

beforeEach(function(done) {
  handlebarsEmailTemplate(options);
  handlebarsEmailTemplate(optionsTwo);

  done();
});

describe('When I trigger my handlebars-email-template the output', function() {
  it('should match with the testData output.', function(done) {

    fs.readFileAsync(path.resolve('test/testData/generated', options.destTemplate + '.html'), 'utf8').then(function(contents) {
        return contents;
    })
    .then(function(testData) {

      fs.readFileAsync(path.resolve('test/testData/generatedTwo', optionsTwo.destTemplate + '.html'), 'utf8')

      .then(function(contents) {
        if(testData === contents) {
          done();
        } else {
          console.log('test data does not match results');
        }

        return;
      })
      .catch(function(e) {
        console.error(e.stack);
      });

      return;
    })
    .catch(function(e) {
      console.error(e.stack);
    });
  });
});

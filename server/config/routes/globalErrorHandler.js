const folderSettings = require('../../settings').folderSettings;
const Resources = require('../../lib/constants/resources');
const errLogger = require('../../lib/errLogger');

module.exports = {
  register(app) {
    // Catch not-found images here
    app.use((req, res, next) => {
      if (~req.originalUrl.indexOf('/img/')) { return res.sendFile(folderSettings.SERVER_SYS_IMAGES_FOLDER + Resources.INDEX_PRODUCT_IMAGE_404_NAME); }

      next();
    });

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // catch custom 404
    app.use((err, req, res, next) => {
      if (err.status === 404) {
        return res.status(404).send(err.message || 'Resource not found');
      }

      next(err);
    });

    // catch bad request errors
    app.use((err, req, res, next) => {
      if (err.status === 400 || (!err.status && err.errors)) {
        // Redirect or send validation errors back to client?
        if (err.errors || err.error) {
          return res.status(400).send(Object.assign(err, { stack: app.get('env') === 'development' ? err.stack : {} }));
        } 
        return res.status(400).send({ message: err.message || 'Bad request error' });
      }

      next(err);
    });

    // catch authentication errors
    app.use((err, req, res, next) => {
      if (err.status === 401) {
        // Redirect or send validation errors back to client?
        if (req.onErrorRedirect) {
          return res.status(302).send({ url: req.onErrorRedirect, error: err });
        } 
        return res.status(401).send(err);
      }

      next(err);
    });

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use((err, req, res, next) => {
        errLogger(err, req).then(() => { });
        res.status(err.status || 500);
        res.send({
          message: err.message,
          error: err,
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res, next) => {
      errLogger(err, req).then(() => { });
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: {},
      });
    });
  },
};

module.exports = {
  register(app) {
    if (process.env.NODE_ENV !== 'production') {
      app.use((req, res, next) => {
        // Examine requests here:
        console.log(`***** Incoming request at: ${req.url}`);
        console.log(' // params: ');
        console.log(req.params);
        console.log('// body:');
        console.log(req.body);
        console.log('// queryString:');
        console.log(req.query);
        console.log('// headers:');
        console.log(req.headers);
        console.log('***** //////////////// *****\n');

        // Call next middleware:
        next();
      });
    }
  },
};

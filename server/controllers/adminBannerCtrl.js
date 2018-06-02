
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require("path");
const fs = require('fs'); 
const patcher = require('jsondiffpatch').create();

const Banner = require('../models/banner');
const auth = require('../config/auth/strategies/basic');
const folderSettings = require('../settings').folderSettings;
const ValidationErrsGen = require('../lib/generateErrors').generateValidationErrors;

router.get('/api/admin/Pancartas', (req, res, next) => {
  const {criteria, page, limit} = req.query;

  Banner.listAll({criteria,page,limit} || {})
       .then(docs => {
          return res.status(200).send({ banners: docs });
       })
       .catch(err => {
          return res.status(400).send(err);
       });
});

router.post('/api/admin/Pancartas',auth.authJwt, auth.adminRequire, (req, res, next)=>{
  const { banner } = req.body
  if(!banner)
    return res.status(400).send('No banner received');
  
  Banner.create(banner).then(savedBanner=>{
      return res.send({banner: savedBanner});
  }).catch(error=>{
    next(error);
  })
});


router.post('/api/admin/Pancartas/:id/image',auth.authJwt, auth.adminRequire, (req, res, next)=>{
  if (!req.params.id)
  return res.status(400).send('No ID received');

return Banner.findById(req.params.id).then((banner)=>{
  if(!banner)
    return res.status(404).send('Not found');

   // Configure middleware to upload file to disk
  const storageOpts = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.resolve(__dirname, folderSettings.SERVER_ADMIN_IMAGES_FOLDER));
    },
    filename(req, file, cb) {
        // Validate file extension
        if (!/\.(jpg|jpeg|png|gif)$/.test(file.originalname) || !file.mimetype.indexOf('image') == 0) {
            cb(ValidationErrsGen([{ message: 'only image files are allowed', propertyName: 'image' }]));
        } else {
            // Generate a unique file name for this shit
            let timeStamp = Date.now().toString();
            timeStamp = timeStamp.substring(timeStamp.length - 6);
            const fileName = (req.params && req.params.id) ?
                req.params.id + '-' + timeStamp + path.extname(file.originalname) : file.originalname;

            cb(null, fileName);
        }
      }
    });

    return new Promise((resolve, reject)=>{
       // Run middleware
       multer({ storage: storageOpts }).single('image')(req, res, function (err) {
        return err ? reject(err) : resolve();
      });
    }).then(()=>{
      const imgFile = req.file;
      if (!imgFile)
        return Promise.reject('Unknown error');
      banner.image.name = imgFile.filename;
      banner.image.src = folderSettings.PUBLIC_ADMIN_IMAGES_FOLDER + imgFile.filename;

      return banner.save().then(()=> res.send({image: banner.image }));
    }).catch(error=>{
      next(error);
    })
  });
});

router.patch('/api/admin/Pancartas/:id',auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id)
    return res.status(400).send('No ID received');
  const { patch } = req.body;
  if (!patch)
    return res.status(400).send('No Patch received');
  Banner.findById(req.params.id)
    .then(oldbanner => {
      if (!oldbanner)
        return res.status(404).send('Not found');
      //receive delta to generate new banner 
      const newbanner = patcher.patch(oldbanner.toObject(), patch);
      newbanner.type ? oldbanner.type = newbanner.type : oldbanner.set('type', undefined);
      oldbanner.tag = newbanner.tag;
      if(oldbanner.isModified())
        return oldbanner.save().then( savedbanner => res.send({ banner: savedbanner }) );
      else 
        return res.send({banner: oldbanner});
    }).catch( error => {
      next(error)
    });
});

router.delete('/api/admin/Pancartas/:id', auth.authJwt, auth.adminRequire, (req, res, next) =>{
  if (!req.params.id)
    return res.status(400).send('No ID received');

  Banner.findByIdAndRemove(req.params.id).then(banner => {
    if (!banner)
      return res.status(404).send('Not found');

    return new Promise((resolve, reject) =>{
      let imgFileName = banner.image.name;
      if(!imgFileName)
        return resolve();
      fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (error) =>{
        return resolve();
       });
    }).then(() =>{
      // Call banner.remove()
      // Just to trigger mongoose middleware
      // (See https://github.com/Automattic/mongoose/issues/1241)
      banner.remove();
      return res.status(202).send();
      });
    }).catch(errs => {
      next(errs);
  });
});

router.delete('/api/admin/Pancartas/:id/image', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id)
      return res.status(400).send('No id received');

  return Banner.findById(req.params.id).then(banner => {
      if (!banner)
          return res.status(404).send('No found');

      const img = banner.image

      if (!img)
          return res.status(404).send('Image not found in banner');

      const imgFileName = path.basename(img.src);

      // Update the product removing the image and returning the new (updated) doc
      return Banner.findByIdAndUpdate(req.params.id, {
          $unset: { image: "" }
      }, { new: true }).then(banner => {
          // Product was updated, delete image from server
          return new Promise(resolve => {
              if (!imgFileName.trim())
                  return resolve();

              fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (err) => {
                  // We don't really care here if there was an error removing the file
                  // TODO: Log this possible error
                  return resolve();
              });
          }).then(() => {
              return res.send({ banner: banner });
          });
      });
  }).catch(errs => {
      next(errs);
  });
});

module.exports = {
  register(app) {
      app.use(router);
  }
};
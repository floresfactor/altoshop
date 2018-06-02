const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require("path");
const patcher = require('jsondiffpatch').create();

const SliderItem = require('../models/sliderItem');
const auth = require('../config/auth/strategies/basic');
const folderSettings = require('../settings').folderSettings;
const ValidationErrsGen = require('../lib/generateErrors').generateValidationErrors;

router.post('/api/admin/sliderItems',auth.authJwt, auth.adminRequire, (req, res, next) => {
  const { sliderItem } = req.body;
  if (!sliderItem)
    return res.status(400).send('Empty request!');

  const item = new SliderItem(sliderItem);

  return item.save().then((newItem)=>{
    return res.status(200).send({ sliderItem: newItem });
  }).catch((error)=>{
      next(error);
  });
});

router.post('/api/admin/sliderItems/:id/image',auth.authJwt, auth.adminRequire, (req, res, next)=>{
  if (!req.params.id)
    return res.status(400).send('No ID received');
  
  return SliderItem.findById(req.params.id).then((item)=>{
    if(!item)
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
        item.image.name = imgFile.filename;
        item.image.src = folderSettings.PUBLIC_ADMIN_IMAGES_FOLDER + imgFile.filename;

        return item.save().then(()=> res.send({image: item.image }));
      }).catch(error=>{
        next(error);
      })
  });
});

router.get('/api/admin/sliderItems', (req, res, next) => {
  const {criteria, page, limit} = req.query;

  SliderItem.listAll({criteria,page,limit} || {})
       .then(docs => {
          return res.status(200).send({ sliderItems: docs });
       })
       .catch(err => {
          return res.status(400).send(err);
       });
});

router.patch('/api/admin/sliderItems/:id', auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id)
    return res.status(400).send('No ID received');
  const { patch } = req.body;
  if (!patch)
    return res.status(400).send('No Patch received');
  SliderItem.findById(req.params.id)
    .then(item => {
      if (!item)
        return res.status(404).send('No found');
      //receive delta to generate new Item 
      const newItem = patcher.patch(item.toObject(), patch);
      item.name = newItem.name;
      item.link = newItem.link;
      item.productGroup.name = newItem.productGroup.name;
      item.productGroup.link = newItem.productGroup.link;
      if(item.isModified())
        return item.save().then( savedItem => res.send({ sliderItem: savedItem }) );
      else 
        return res.send({sliderItem: item});
    }).catch( error => {
      next(error)
    });
});

router.delete('/api/admin/sliderItems/:id', auth.authJwt, auth.adminRequire, (req, res, next) =>{
  if (!req.params.id)
    return res.status(400).send('No ID received');

  SliderItem.findByIdAndRemove(req.params.id).then(item => {
    if (!item)
      return res.status(404).send('Not found');

    return new Promise((resolve, reject) =>{
      let imgFileName = item.image.name;
      if(!imgFileName)
        return resolve();
      fs.unlink(folderSettings.SERVER_ADMIN_IMAGES_FOLDER + imgFileName, (error) =>{
        return resolve();
       });
    }).then(() =>{
      // Call item.remove()
      // Just to trigger mongoose middleware
      // (See https://github.com/Automattic/mongoose/issues/1241)
      item.remove();
      return res.status(202).send();
      });
    }).catch(errs => {
      next(errs);
  });
});

router.delete('/api/admin/sliderItems/:id/image',auth.authJwt, auth.adminRequire, (req, res, next) => {
  if (!req.params.id)
      return res.status(400).send('No id received');

  return SliderItem.findById(req.params.id).then(item => {
      if (!item)
          return res.status(404).send('No found');

      const img = item.image

      if (!img)
          return res.status(404).send('Image not found in item');

      const imgFileName = path.basename(img.src);

      // Update the product removing the image and returning the new (updated) doc
      return SliderItem.findByIdAndUpdate(req.params.id, {
          $unset: { image: "" }
      }, { new: true }).then(item => {
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
              return res.send({ sliderItem: item });
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
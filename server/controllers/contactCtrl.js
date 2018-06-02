const express = require('express');
const router = express.Router();

const emailService = require('../config/mailer/emailService');

router.post('/api/contact',(req,res,next)=>{
  if(!req.body.contact)
    return res.status(400).send({ message: "Not contact information provided"});
  const { contact } = req.body;
    emailService.onContactSubmited(contact,true).then(()=>{
      return res.status(200).send({ message: 'Gracias por su apoyo, lo contactaremos en breve'});
    }).catch(error =>{
      next(error);
    })
});

module.exports ={
  register(app) {
    app.use(router);
  }
}
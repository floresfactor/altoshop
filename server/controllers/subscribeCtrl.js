const express = require('express');
const router = express.Router();

const Subscription = require('../models/subscription');
const emailService = require('../config/mailer/emailService');

router.post('/api/suscribeByEmail', async (req, res, next)=>{
  const { subscription } = req.body;
  let sub;
  let email;
  if(!subscription)
    return res.status(400).send("no subscription data send");
  try {
     sub =  await Subscription.create(subscription);
     email = await emailService.onNewSubscription(sub, true);
  }catch(err){
    next(err);
  }
  return res.status(201).send({subscription: sub});
});

module.exports = {
  register(app) {
      app.use(router);
  }
};
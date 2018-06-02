const express = require('express');

const router = express.Router();

const Order = require('../models/order');
const emailService = require('../config/mailer/emailService');

// ************
// ** Routes **
// ************

router.post('/api/conektaWebHook', (req, res, next) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Just return success if received data is not complete enough for what we are waiting for
  if (!(body && body.type && body.data && body.data.object && body.data.object.object)) { return res.sendStatus(200); }

  // Is this the event we are listening for?
  if ((typeof body.type === 'string' && body.type.toUpperCase()) === 'CHARGE.PAID' &&
        (typeof body.data.object.object === 'string' && body.data.object.object.toUpperCase() === 'CHARGE')) {
    const receivedConektCharge = body.data.object;
    const conektaOrderID = receivedConektCharge.order_id;

    if (!conektaOrderID) { return res.sendStatus(200); }

    return Order.findOne({ payments: { $elemMatch: { externalReference: conektaOrderID } } }).then(order => {
      if (!order) { return res.sendStatus(200); }

      // The specific payment mapping from this conektaOrder
      const payment = order.payments.find(payment => payment.externalReference == conektaOrderID);

      // We already registered this conektaOrder under this payment
      if (payment.status === 'PAID') { return res.sendStatus(200); }

      // Verify that the payment went through AND that the total amount was covered
      if (!(typeof receivedConektCharge.status === 'string' && receivedConektCharge.status.toUpperCase() === 'PAID') ||
                !((Math.abs((receivedConektCharge.amount / 100) - payment.amount)) < Number.EPSILON)) {
        // Todo: Do something in this case, specially when the total amount wasn't covered?
        // Todo: Be sure that conekta sends the amount in cents (receivedConektCharge.amount / 100)
        return res.sendStatus(200);
      }

      payment.status = 'PAID';
      const targetItemCharges = [];

      // Get the charges this payment/conektaOrder was targetting for
      order.items.forEach(orderItem => orderItem.charges.forEach(orderItemCharge => {
        if (orderItemCharge.payment.toString() == payment._id)
          {targetItemCharges.push(orderItemCharge);}
      }));

      // Store item charges in payment
      targetItemCharges.forEach(i => {
        // Update payment with the related itemCharges
        payment.concepts.addToSet({
          orderItem: i.parent()._id,
          itemCharge: i._id,
        });

        i.status = 'PAID';
      });

      // Is the order done paying?
      const totalCharged = order.payments.map(p => p.amount).reduce((a, b) => a + b);
      if (Math.abs(order.total - totalCharged) < 0.5)
        {order.status = "PAID";}

      // Save order
      return order.save().then(() => {
        const fetchOrderEmailDataPromises = [order.populateOrderFromRecord(), order.populateFields(['customer'])];

        return Promise.all(fetchOrderEmailDataPromises).then(orderFromRecordObj => {
          const ctx = {
            customer: order.customer.toObject(),
            partialPayment: order.total - (receivedConektCharge.amount / 100),
            amount: receivedConektCharge.amount / 100,
            id_pago: conektaOrderID,
            total: order.total,
            shipment: order.shipment.toObject(),
            payments: order.payments.toObject(),
            meetingDate: order.shipment.dateTime,
          };
          // Update orderData items with updated items (including discounts, complete info etc)
          emailService.onOrderPaid(ctx, false);
        }).then(() => res.sendStatus(200)).catch(() => res.sendStatus(200));
      });
    });
  }

  return res.sendStatus(200);
});

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

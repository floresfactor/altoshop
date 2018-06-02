const currencyFormat = require('../lib/util').currencyFormat;

const express = require('express');

const router = express.Router();
const emailService = require('../config/mailer/emailService');
const authenticateBasic = require('../config/auth/strategies/basic').authenticateBasic;
const auth = require('../config/auth/strategies/basic');
const moment = require('moment');

const Order = require('../models/order');
const Customer = require('../models/customer');
const notFoundErr = require('../lib/generateErrors').generateNotFoundError;
const authError = require('../lib/generateErrors').generateAuthErrors;
const amqp = require('amqplib/callback_api');

router.get('/api/orders', auth.authJwt, (req, res, next) => {
  const options = req.query;
  // const user = req.user.id;
  // if (!user || !user.customer) { return res.send({ results: [], count: 0 }); }
  Customer.findOne({ account: req.user.id }).then((customer) => {
    options.filterBy = Object.assign({}, options.filterBy, { customer: customer._id });

    return Order.listPaginated(options).then(pagination => {
      const orders = pagination.docs;
      const total = pagination.total;

      // Include populated customer on full listed
      const populatePromises = orders.map(p => p.populateFields(['customer']));

      return Promise.all(populatePromises).then(() => res.send({ results: orders, count: total }));
    });
  }).catch(err => {
    next(err);
  });
});

router.get('/api/orders/:id', auth.authJwt, (req, res, next) => {
  // const user = req.user;

  // if (!user || !user.customer) { return res.status(401).send('No user authentication received'); }

  if (!req.params.id) { return res.status(400).send('No order ID received'); }
  Customer.findOne({ account: req.user.id }).then((customer) => Order.findById(req.params.id).then(doc => {
    if (!doc) { return next(notFoundErr('Order not found')); }

    if (doc.customer.toString() !== customer._id.toString()) { return next(authError([{ message: 'Customer mistmatch', propertyName: 'account.customer' }])); }

    return doc.populateFields(['customer', 'payments.paymentMethod']).then(doc => doc.populateOrderFromRecord().then(docObj => res.send(docObj)));
  }).catch(err => {
    next(err);
  }));
});

router.post('/api/orders', (req, res, next) => {
  let { order, customer } = req.body;

  if (!order) { return res.status(400).send('No order received'); }

  order = new Order(order);
  order.status = 'PENDING';

  return order.validateSchema().then(() => order.validateCustomer().then(() => order.validateItemsStock().then(() => order.validateItemPrices().then(() => order.validateOrderItemsCharges().then(() => order.deductItemsStock().then(() => order.validatePaymentData(order.payments[0]).then(() => {
    // Generate item charges for createExternalPayment function
    const itemCharges = [];
    order.items.forEach(i => i.charges.forEach(c => itemCharges.push(c)));

    return order.createExternalPayment(order.payments[0], itemCharges).then(() => {
      // Create email data for email triggers
      const orderObj = order.toObject();
      const customerDoc = new Customer(order.customer);

      return customerDoc.populateCartItems().then(cartItems => {
        // check if exists cartItems and cartItems are same as order items
        // (bug caused by completing an order and getting an error avoiding to update client data)
        // if the client send again the request the cart items will be the same that last order
        // and the current order will have no products
        if (!cartItems.length) { return Promise.reject(new Error('No cart items')); }
        if (cartItems.length != orderObj.items.length) { return Promise.reject(new Error('Cart items and order items are not the same')); }
        for (let i = 0; i < cartItems.length; ++i) {
          if (cartItems[i].id != orderObj.items[i].id) { return Promise.reject(new Error('Cart items and order items are not the same')); }
        }

        const orderData = Object.assign(orderObj, {
          branch: orderObj.shipment.branch,
          customer: orderObj.customer,
          items: orderObj.items,
          populatedOrderItems: order.populatedOrderItems,
          cartItems,
        });

        const orden = {
          nombre: order.customer.firstName,
          apellido: order.customer.lastName,
          total: order.total,
          telefono: order.customer.phone,
          
        };

        // Update orderData items with updated items (including discounts, complete info etc)
        emailService.onOrderCreated(orderData, false);


        amqp.connect('amqp://localhost', function(err, conn) {
          conn.createChannel(function(err, ch) {
            var q = '3';
            //var q2 = 'ORDER';
            //var msg = customerDoc;

            //var msj = JSON.stringify(customerDoc);
            var msj = JSON.stringify(orden);
          

            ch.assertQueue(q, { durable: false });
            //ch.assertQueue(q2, { durable: false });
            // Note: on Node 6 Buffer.from(msg) should be used
            ch.sendToQueue(q, new Buffer.from(msj));
            //ch.sendToQueue(q2, new Buffer.from(orderMQ));
            //console.log(" [x] Sent %s", json);
          });
          /*setTimeout(function() { conn.close();
            process.exit(0) }, 500);*/
        });
        
        return order.removeOrderItemsFromCustomerCart().then(() => order.persist().catch(errs =>
          // Order was already charged to the customer here, handle wiselly!
          /*
                                                    Todo: We can't lose track of this order
                                                    - Persist the order information somewhere
                                                    - Generate an error notifications someone sees and fixes
                                                */
          Promise.reject(errs)
        ));
      });
    }).catch(errs => {
      // External API errors catched here
      // Todo: Study the API errors and make something usefull of them
      order.handleProvidersErrors(errs); // this method is empty!, not impleneted yet.
      return Promise.reject(errs);
    });
  })).catch(errs =>
    // Errors happening after deducting item stocks (i.e. deductItemsStock function) catched here
    // It's important to bubble any errors here once that item stocks had been deducted to restore
    order.rollbackItemStocks(errs) // <-- Always rejects, bubbling rejection as we in fact want
  )))))).then((newOrder) => {
    // Get rid of the populatedOrderItems and return
    delete newOrder.populatedOrderItems;
    return res.send(newOrder);
  }).catch(errs => {
    next(errs);
  });
});

module.exports = {
  register(app) {
    app.use(router);
  },
};

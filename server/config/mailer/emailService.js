const errLoger = require('../../lib/errLogger');
const emailTemplateSender = require('./mailer').EmailTemplateSender;
const moment = require('moment');
const currencyFormat = require('../../lib/util').currencyFormat;

// branch email
const branchMail = 'gerardo.t.o@hotmail.com';
// Todo: set the branch/admin email here or in subject.hbs template

const onOrderCreated = (orderData, throwOnFail = true) => {
  let templates = [{ name: 'user-order-created-instructions', mailTo: orderData.customer.email }];

  const paymentType = orderData && orderData.payments[0].type;

  if (paymentType === 'card') {
    templates = templates.concat([{ name: 'branch-card-order-completed', mailTo: branchMail }, { name: 'user-card-order-completed', mailTo: orderData.customer.email }]);
  } else if (paymentType === 'oxxo_cash') {
    templates = templates.concat([{ name: 'user-oxxo-order-created', mailTo: orderData.customer.email }]);
  }

  // get the diff in hours between server's date and chihuahua's date
  const chihServDiff = Number(moment(orderData.createdAt).format('Z').slice(0, 3)) + 7;
  const formatedCreatedAt = moment(orderData.createdAt).add(chihServDiff, 'hours').format('dddd D MMMM Y h:mm a');

  // Formating order items array and getting total pending, total first payment
  let totalPending = 0;
  let totalFirstPayment = 0;

  const items = orderData.items.map((item, idx) => {
    const populatedItem = orderData.populatedOrderItems.find(i => item.itemID.toString() == i._id);
    const pending = item.price - item.charges[0].amount;

    totalPending += pending;
    totalFirstPayment += item.charges[0].amount;

    return Object.assign({}, item, {
      pending: currencyFormat(pending),
      itemDetails: populatedItem,
      parent: orderData.cartItems[idx].parent,
      price: currencyFormat(item.price),
      firstPaymentAmount: currencyFormat(item.charges[0].amount),
    });
  });

    // formating oxxo data
  let oxxoReference;
  if (orderData.payments[0].type == 'oxxo_cash') {
    // provably missing orderdata.payments!!!!!!!!!!!!!!!!!!!!
    const ref = orderData.payments[0].paymentReference;
    oxxoReference = `${ref.slice(0, 4)}-${ref.slice(4, 8)}-${ref.slice(8, 12)}-${ref.slice(12, 14)}`;
    totalFirstPayment = currencyFormat(totalFirstPayment);
  }

  const ctx = Object.assign({}, orderData, {
    // timeZone: orderData.shipment.dateTime.toTimeString().match(/\([A-Z\s\(ñáéíóú]+\)\)/i),  //Regex to format the timezone
    formatedDate: moment(orderData.shipment.dateTime).format('dddd D MMMM Y h:mm a'),
    oxxoReference,
    formatedCreatedAt,
    totalFirstPayment,
    totalPending: currencyFormat(totalPending),
    total: currencyFormat(orderData.total),
    items,
  });

  return Promise.all(templates.map(template => {
    ctx.mailTo = template.mailTo;
    return emailTemplateSender(template.name, ctx);
  })).catch(errs => {
    errLoger(errs);

    return throwOnFail ? Promise.reject(errs) : Promise.resolve();
  });
};

const onOrderPaid = (data, throwOnFail = true) => {
  const templates = [{ name: 'user-oxxo-order-paid', mailTo: data.customer.email }, { name: 'branch-oxxo-order-paid', mailTo: branchMail }];

  // formating the context info
  const ctx = Object.assign({}, data, {
    date: moment().format('dddd DD MMMM YYYY HH:mma'),
    amount: currencyFormat(data.amount),
    formatedDate: moment(data.shipment.dateTime).format('dddd D MMMM Y h:mm a'),
    total: currencyFormat(data.total),
  });

  return Promise.all(templates.map(template => {
    // set who to send the current template in mailer context
    ctx.mailTo = template.mailTo;

    return emailTemplateSender(template.name, ctx);
  })).catch(errs => {
    errLoger(errs);

    return throwOnFail ? Promise.reject(errs) : Promise.resolve();
  });
};

// 'name' can be either customer full name or email if we don't have the customer on db
const onAccountRegister = (info, throwOnFail = true) => {
  const templates = [{ name: 'user-account-register', mailTo: info.email }, { name: 'branch-account-register', mailTo: branchMail }];

  return Promise.all(templates.map(template => {
    const ctx = Object.assign({}, info, {
      mailTo: template.mailTo,
    });

    return emailTemplateSender(template.name, ctx);
  })).catch(errs => {
    errLoger(errs);

    return throwOnFail ? Promise.reject(errs) : Promise.resolve();
  });
};

// 'customer' could be undefined if we don't have the record on db
const onSendAccountPasswordResetEmail = (account, customer, throwOnFail = true) => {
  const templates = ['recovery-pwd'];

  return Promise.all(templates.map(template => emailTemplateSender(template, { account, customer, mailTo: customer.email }))).catch(errs => {
    errLoger(errs);

    return throwOnFail ? Promise.reject(errs) : Promise.resolve();
  });
};

// 'customer' could be undefined if we don't have the record on db
const onAccountPasswordChanged = (account, customer, throwOnFail = true) => {
  const templates = ['account-reset-password-success'];

  return Promise.all(templates.map(template => emailTemplateSender(template, { account, customer, mailTo: customer.email }))).catch(errs => {
    errLoger(errs);

    return throwOnFail ? Promise.reject(errs) : Promise.resolve();
  });
};

const onContactSubmited = (contact, throwOnFail = false ) =>{
    let templates = ['user-contact'];
    return Promise.all(templates.map(template =>{ 
        emailTemplateSender(template, { contact, mailTo: 'reservaciones@kopay.com.mx' } );
    }))
    .catch(errs =>{
        return throwOnFail ? Promise.reject(errs) : Promise.resolve();
    });
};

const onNewSubscription = (subscription, throwOnFail = false)=>{
    let templates = ['user-subscription'];
    return Promise.all(templates.map(template =>{ 
        emailTemplateSender(template, { subscription, mailTo: subscription.email } );
    }))
    .catch(errs =>{
        return throwOnFail ? Promise.reject(errs) : Promise.resolve();
    });
}

module.exports = {
    onOrderCreated,
    onOrderPaid,
    onAccountRegister,
    onSendAccountPasswordResetEmail,
    onAccountPasswordChanged,
    onContactSubmited,
    onNewSubscription
};

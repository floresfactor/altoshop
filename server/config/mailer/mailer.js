const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');

const appSettings = require('../../settings').appSettings;

let mailOptions;
let emailService;

function configure() {
  mailOptions = {
    to: appSettings.EMAIL_DEFAULT_TO,
    subject: appSettings.EMAIL_DEFAULT_SUBJECT,
    text: appSettings.EMAIL_DEFAULT_TEXT,
  };

  emailService = nodemailer.createTransport(
    {
      host: appSettings.EMAIL_HOST,
      port: appSettings.EMAIL_PORT,
      secure: appSettings.EMAIL_SECURE,
      auth: {
        user: appSettings.EMAIL_AUTH_USER,
        pass: appSettings.EMAIL_AUTH_PASS,
      },
    },
    mailOptions
  );
}

// Initialize configuration
(function () {
  configure();
}());

function resetConfig() {
  configure();
}

function loadTemplate(templateName, context) {
  const template = new EmailTemplate(
    path.join(__dirname, 'templates', templateName)
  );
  return new Promise((resolve, reject) => {
    template.render(context, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        email: result,
        context,
      });
    });
  });
}

function EmailTemplateSender(template, context) {
  return loadTemplate(template, context).then((results) =>
    // console.log(results.context);
    emailService.sendMail({
      to: results.to || results.context.mailTo,
      from: 'soporte@kopay.com.mx',
      subject: results.email.subject,
      html: results.email.html,
    })

  );
}

module.exports = {
  emailService,
  EmailTemplateSender,
  ResetConfig: resetConfig,
};

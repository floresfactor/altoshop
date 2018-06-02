const express = require('express');

const router = express.Router();
const fs = require('fs');

const appSettings = require('../settings').appSettings;
const JSONSettingsFilePath = require('../settings').JSONSettingsFilePath;
const auth = require('../config/auth/strategies/basic');

// const adminAuthenticateBasic = require('../config/auth/strategies/basic').adminAuthenticateBasic;

// ************
// ** Routes **
// ************

const getMergedPublicJsonSettings = () => {
  // Filter non-public properties
  const jsonSettings = JSON.parse(fs.readFileSync(JSONSettingsFilePath));
  for (const sett in jsonSettings) {
    if (!jsonSettings[sett].public) {
      delete jsonSettings[sett];
    } else if (!jsonSettings[sett].value && appSettings[sett]) // Some settings have json file external GET's/SET's
    { jsonSettings[sett].value = appSettings[sett]; }
  }

  return jsonSettings;
};

router.get('/api/settings', auth.adminRequire, auth.authJwt, (req, res) =>

  // Return json settings
  res.send(getMergedPublicJsonSettings())
);

router.post('/api/settings/:setting', auth.adminRequire, auth.authJwt, (req, res, next) => {
  if (!req.params.setting || (undefined === appSettings[req.params.setting])) { return res.status(404).send('Setting not found'); }

  const { value } = req.body;
  if (value === undefined) { return res.status(400).send(); }

  appSettings[req.params.setting] = value;
  return res.send({ [req.params.setting]: getMergedPublicJsonSettings()[req.params.setting] });
});

// Register routes-middleware on server app
module.exports = {
  register(app) {
    app.use(router);
  },
};

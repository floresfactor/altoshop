const appSettings = require('../../settings').appSettings;

module.exports = {
  INDEX_PRODUCT_IMAGE_404_NAME: 'no-image.png',
  JWT_SECRET:
    'a]thpEQ0v§)YNd7DpHD8WT$~%pgnvj8mK§@l5?N1/p_dul?v:EA2#(F°°X819+<o',
  JWT_SECRET_2:
    '!ugQl!7hMjm>NmZPo9X9§CxZtx%<QNy}<Cf0-,DT39;§KF?ki{4/Y)u#[<m28&b1', // this is if we use refreshToken
  EMAIL_SECRET:
    'X$%a_g[fpc)h_SsC|sr11[RgHTX{r&~B-/PC]E^ghs<F?zvnpgp}Z_$YG60DIJS)',
  GOOGLE_KEYS: {
    clientId:
      '446883172264-a2i5rnimhhu80alombfg2ck0eenhlun0.apps.googleusercontent.com',
    clientSecretKey: '6LfTQVoUAAAAACO9UB-5Zjo5wzMwzNmxfnznHV36',
    //callbackURL: 'http://localhost:3005/auth/google/callback',
    callbackURL: appSettings.SERVER_ADDRESS || 'http://localhost:3005/auth/google/callback'
  },
  FACEBOOK_KEYS: {
    clientID: '1599862790110391',
    clientSecret: '27587e06e4dfcabeea2faed5785e42c7',
    //callbackURL: 'http://localhost:3005/auth/facebook/callback',
    callbackURL: appSettings.SERVER_ADDRESS || 'http://localhost:3005/auth/facebook/callback'
  },
  //GOOGLE_CAPTCHA_SECRET_KEY: '6Lcs-EYUAAAAABnz0KXdJf0D1fTqXSFN89chJLKH',
  GOOGLE_CAPTCHA_SECRET_KEY: '6LfTQVoUAAAAACO9UB-5Zjo5wzMwzNmxfnznHV36'
};

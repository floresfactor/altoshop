import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './store/configureStore';
require('./favicon.ico'); // Tell webpack to load favicon.ico

// ************
// *** i18n  ***
// bs was here
// ************

// Locale packages
// import { IntlProvider, addLocaleData } from 'react-intl';
// import en from 'react-intl/locale-data/en';
// import es from 'react-intl/locale-data/es';
// import localeData from './i18n/locales/all.json';
import { LocaleProvider } from 'antd';
import esES from 'antd/lib/locale-provider/es_ES';

// addLocaleData([...en, ...es]);

// Intercept XHR
import { interceptRedirections } from './lib/http';
interceptRedirections();

// Define user's language. Different browsers have the user locale defined
// on different fields on the `navigator` object, so we make sure to account
// for these different by checking all of them
// const language = (navigator.languages && navigator.languages[0]) ||
//     navigator.language ||
//     navigator.userLanguage;

// Split locales with a region code
// const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// Try full locale, try locale without region code, fallback to 'en'
// const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en;

// Import Loading persist storage
import Loading from './ui/common/components/loading.jsx';
// ****************************
// *** React main component ***
// ****************************
import AppIndex from './ui/appIndex.jsx';

// ***********************
// *** Initial configs ***
// ***********************
import './lib/init';

import { setToken } from './lib/util/configAuth';
let persist = JSON.parse(localStorage.getItem('persist:kopay'));
if(persist && persist.account){
  const { token } = JSON.parse(persist.account);
  setToken(token);
}


// ***********************
// ***** CSS/Less styles *
// ***********************
import 'react-image-gallery/styles/css/image-gallery.css';
import './styles/index.less';
const App = () => {
  return (
    <LocaleProvider locale={esES}>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          {/* <IntlProvider locale={language} messages={messages}> */}
          <AppIndex />
          {/* </IntlProvider> */}
        </PersistGate>
      </Provider>
    </LocaleProvider>
  );
};

render(<App />, document.getElementById('app'));

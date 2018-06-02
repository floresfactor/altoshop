import { createStore, compose, applyMiddleware } from 'redux';
// import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import rootReducer from '../reducers/index';

import initialState from './initialState';

const persistConfig = {
  key: 'kopay',
  storage: storage,
  whitelist: ['account'], // only account and shoppingCart will be persisted
  //transforms: [expireTransform]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

function configureStoreProd(initialState) {
  const middlewares = [
    thunk
  ];

  return createStore(persistedReducer, initialState, compose(applyMiddleware(...middlewares)));
}

function configureStoreDev(initialState) {
  const middlewares = [
    // reduxImmutableStateInvariant(),
    thunk
  ];

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // add support for Redux dev tools
  const store = createStore(persistedReducer, initialState, composeEnhancers(applyMiddleware(...middlewares)));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

const configureStore = process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev;


export const store = configureStore(initialState);
export const persistor = persistStore(store);


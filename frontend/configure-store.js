import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { actionSideEffectMiddleware } from 'redux-side-effect';

import createRootReducer from './reducers/index';

let middleware = [
  thunkMiddleware,
  actionSideEffectMiddleware
];

if (process.env.NODE_ENV !== 'production') {
  const logger = require('redux-logger')({ collapsed: true });
  middleware = [...middleware, logger];
}

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

export default function configureStore(socket, initialState) {
  return createStoreWithMiddleware(createRootReducer(socket), initialState);
}

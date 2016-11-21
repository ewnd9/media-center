import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { actionSideEffectMiddleware } from 'redux-side-effect';
import createApiCallMiddleware from './middleware/api-call-middleware';

import createRootReducer from './reducers/index';
import notify from './notify';

export default function configureStore({ socket, api }, initialState) {
  let middleware = [
    thunkMiddleware.withExtraArgument({ api }),
    createApiCallMiddleware({ api }, notify.error),
    actionSideEffectMiddleware
  ];

  if (process.env.NODE_ENV !== 'production') {
    const logger = require('redux-logger')({ collapsed: true });
    middleware = [...middleware, logger];
  }

  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  return createStoreWithMiddleware(createRootReducer(socket), initialState);
}

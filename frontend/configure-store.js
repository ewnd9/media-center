import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { actionSideEffectMiddleware } from 'redux-side-effect';

import createLogger from 'redux-logger';
const logger = createLogger();

import createRootReducer from './reducers/index';

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  actionSideEffectMiddleware,
  logger
)(createStore);

export default function configureStore(socket, initialState) {
  return createStoreWithMiddleware(createRootReducer(socket), initialState);
}

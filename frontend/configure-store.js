import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { actionSideEffectMiddleware } from 'redux-side-effect';

import createLogger from 'redux-logger';
const logger = createLogger();

import rootReducer from './reducers/index';

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  actionSideEffectMiddleware,
  logger
)(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}

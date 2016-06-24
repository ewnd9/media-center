import { createStore, applyMiddleware } from 'redux';

import thunkMiddleware from 'redux-thunk';
import { actionSideEffectMiddleware } from 'redux-side-effect';

import rootReducer from './reducers/index';

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  actionSideEffectMiddleware
)(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}

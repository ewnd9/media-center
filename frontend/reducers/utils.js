import { createCheckedReducer as createTcomb } from 'redux-tcomb';

export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
}

export function createCheckedReducer(initialState, handlers, schema) {
  return createTcomb(createReducer(initialState, handlers), schema);
}

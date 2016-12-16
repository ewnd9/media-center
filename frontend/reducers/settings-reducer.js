import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  FETCH_TRAKT_PIN_SUCCESS,

  POST_TRAKT_PIN_REQUEST,
  POST_TRAKT_PIN_SUCCESS,
  POST_TRAKT_PIN_FAILURE,

  SHOW_PIN_INPUT
} from '../actions/settings-actions';

export const schema = t.struct({
  currentAction: t.maybe(t.String),
  pinInputShown: t.Boolean,
  hasPin: t.Boolean
});

export default createCheckedReducer({
  currentAction: null,
  pinInputShown: false,
  hasPin: false
}, {
  [FETCH_TRAKT_PIN_SUCCESS](state, action) {
    const hasPin = action.response.status === 'ok';

    return {
      ...state,
      hasPin,
      pinInputShown: !hasPin
    };
  },
  [POST_TRAKT_PIN_REQUEST](state) {
    return {
      ...state,
      currentAction: POST_TRAKT_PIN_REQUEST
    };
  },
  [POST_TRAKT_PIN_SUCCESS](state) {
    return {
      ...state,
      currentAction: null,
      pinInputShown: false,
      hasPin: true
    };
  },
  [POST_TRAKT_PIN_FAILURE](state) {
    return {
      ...state,
      currentAction: null,
      pinInputShown: false
    };
  },
  [SHOW_PIN_INPUT](state) {
    return {
      ...state,
      pinInputShown: !state.pinInputShown
    };
  }
}, schema);

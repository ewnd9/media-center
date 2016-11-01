import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  FETCH_SCREENSHOTS_REQUEST,
  FETCH_SCREENSHOTS_SUCCESS,
  FETCH_SCREENSHOTS_FAILURE
} from '../actions/screenshots-actions';

export const schema = t.struct({
  isFetching: t.Boolean,
  screenshots: t.list(t.String)
});

export default createCheckedReducer({
  isFetching: false,
  screenshots: []
}, {
  [FETCH_SCREENSHOTS_REQUEST](state) {
    return {
      ...state,
      isFetching: true
    };
  },
  [FETCH_SCREENSHOTS_SUCCESS](state, action) {
    return {
      ...state,
      isFetching: false,
      screenshots: action.response.files
    };
  },
  [FETCH_SCREENSHOTS_FAILURE](state) {
    return {
      ...state,
      isFetching: false
    };
  }
}, schema);

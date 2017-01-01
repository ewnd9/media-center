import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  POST_TORRENT_REQUEST,
  POST_TORRENT_SUCCESS,
  POST_TORRENT_FAILURE
} from '../actions/torrents-actions';

export const schema = t.struct({
  isFetching: t.Boolean
});

export default createCheckedReducer({
  isFetching: false,
}, {
  [POST_TORRENT_REQUEST](state) {
    return {
      ...state,
      isFetching: true
    };
  },
  [POST_TORRENT_SUCCESS](state) {
    return {
      ...state,
      isFetching: false
    };
  },
  [POST_TORRENT_FAILURE](state) {
    return {
      ...state,
      isFetching: false
    };
  }
}, schema);

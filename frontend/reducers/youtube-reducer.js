import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  YOUTUBE_STATE_INIT,
  YOUTUBE_STATE_SUCCESS,
  YOUTUBE_STATE_ERROR,

  YOUTUBE_CHANGE_URL,
} from '../actions/youtube-actions';

export const schema = t.struct({
  url: t.String,
  status: t.enums.of([
    YOUTUBE_STATE_INIT,
    YOUTUBE_STATE_SUCCESS,
    YOUTUBE_STATE_ERROR
  ])
});

export default createCheckedReducer({
  url: '',
  status: YOUTUBE_STATE_INIT
}, {
  [YOUTUBE_CHANGE_URL](state, action) {
    return {
      ...state,
      url: action.url,
      status: action.status
    };
  }
}, schema);

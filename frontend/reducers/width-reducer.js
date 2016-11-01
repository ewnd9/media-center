import { createCheckedReducer } from './utils';

import t from 'tcomb';
import { CHANGE_WIDTH } from '../actions/width-actions';

export const schema = t.struct({
  isWideScreen: t.Boolean
});

export default createCheckedReducer({
  isWideScreen: false
}, {
  [CHANGE_WIDTH](state, action) {
    return {
      ...state,
      isWideScreen: action.width > 1080 // large-viewport from theme.css
    };
  }
}, schema);

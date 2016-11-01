import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  RECIEVE_PLAYBACK,
  PLAYBACK_EMIT_EVENT
} from '../actions/playback-actions';

export const schema = t.struct({
  playback: t.maybe(t.Object)
});

export default socket => {
  return createCheckedReducer({
    playback: null
  }, {
    [RECIEVE_PLAYBACK](state, action) {
      return {
        ...state,
        playback: action.playback
      };
    },
    [PLAYBACK_EMIT_EVENT](state, action) {
      action.sideEffect(() => {
        socket.emit(action.event, {});
      });

      return state;
    }
  }, schema);
};

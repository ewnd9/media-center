import {
  RECIEVE_PLAYBACK,
  PLAYBACK_EMIT_EVENT
} from '../actions/playback-actions';

export default socket => {
  function playback(state = {
    playback: null
  }, action) {
    switch (action.type) {
      case RECIEVE_PLAYBACK:
        return {
          ...state,
          playback: action.playback
        };
      case PLAYBACK_EMIT_EVENT:
        action.sideEffect(() => {
          socket.emit(action.event, {});
        });
        
        return state;
      default:
        return state;
    }
  }

  return playback;
};

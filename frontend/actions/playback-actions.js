import {
  USER_PAUSE_MEDIA,
  USER_CLOSE
} from '../constants';

export const RECIEVE_PLAYBACK = 'RECIEVE_PLAYBACK';
export const PLAYBACK_EMIT_EVENT = 'PLAYBACK_EMIT_EVENT';

function emitEvent(event) {
  return {
    type: PLAYBACK_EMIT_EVENT,
    event
  };
}

export function emitPlay() {
  return emitEvent(USER_PAUSE_MEDIA);
}

export function emitPause() {
  return emitEvent(USER_PAUSE_MEDIA);
}

export function emitClose() {
  return emitEvent(USER_CLOSE);
}

export function recievePlayback(playback) {
  return {
    type: RECIEVE_PLAYBACK,
    playback
  };
}

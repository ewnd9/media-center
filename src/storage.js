const storage = require('dot-file-config')('.badtaste-npm', {
  cloudSync: false
});

import events from 'events';

let EventEmitter = events.EventEmitter;
let emitter = new EventEmitter();

storage.emit = emitter.emit.bind(emitter);
storage.on = emitter.on.bind(emitter);

export const PLAY_MEDIA = 'PLAY_MEDIA';
export const PAUSE_MEDIA = 'PAUSE_MEDIA';

export const USER_PAUSE_MEDIA = 'USER_PAUSE_MEDIA';
export const USER_CLOSE = 'USER_CLOSE';
export const USER_NEXT_AUDIO = 'USER_NEXT_AUDIO';
export const USER_SEEK_FORWARD = 'USER_SEEK_FORWARD';
export const USER_TOGGLE_SUBTITLES = 'USER_TOGGLE_SUBTITLES';
export const USER_TOGGLE_VIDEO = 'USER_TOGGLE_VIDEO';

export const SCROBBLE = 'SCROBBLE';

export default storage;

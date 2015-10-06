var storage = require('dot-file-config')('.badtaste-npm', {
  cloudSync: false
});

import events from 'events';

let EventEmitter = events.EventEmitter;
let emitter = new EventEmitter();

storage.emit = emitter.emit.bind(emitter);
storage.on = emitter.on.bind(emitter);

export const PLAY_MEDIA = 'PLAY_MEDIA';
export const PAUSE_MEDIA = 'PAUSE_MEDIA';
export const OPEN_MEDIA = 'OPEN_MEDIA';

export default storage;

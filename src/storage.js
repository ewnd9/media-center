const storage = require('dot-file-config')('.media-center-npm', {
  cloudSync: false
});

import events from 'events';

const EventEmitter = events.EventEmitter;
const emitter = new EventEmitter();

storage.emit = emitter.emit.bind(emitter);
storage.on = emitter.on.bind(emitter);
storage.removeListener = emitter.removeListener.bind(emitter);
storage.lastPlaybackStatus = null;

export default storage;

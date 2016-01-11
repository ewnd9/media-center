const storage = require('dot-file-config')('.media-center-npm', {
  cloudSync: false
});

import events from 'events';

let EventEmitter = events.EventEmitter;
let emitter = new EventEmitter();

storage.emit = emitter.emit.bind(emitter);
storage.on = emitter.on.bind(emitter);
storage.removeListener = emitter.removeListener.bind(emitter);

export default storage;

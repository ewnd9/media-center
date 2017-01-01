import chokidar from 'chokidar';
import { exec } from 'child_process';

import storage from './storage';
import report from './agent';
import throttle from 'lodash/throttle';

import {
  USER_CLOSE,
  USER_KEY_PRESS,
  USER_OPEN_BROWSER,
  USER_PAUSE_MEDIA,
  USER_SCREENSHOT,
  USER_SCREEN_OFF,
  OMX_KEYS,
  RELOAD_FILES,
  STOP_PLAYBACK,
  UPDATE_PLAYBACK
} from './constants';

import {
  screenshotPath,
  port,
  mediaPath
} from './config';

function Bus(services, io) {
  storage.on(USER_KEY_PRESS, key => {
    services.playerService.onKeyPress(key);
  });

  storage.on(UPDATE_PLAYBACK, data => {
    storage.lastPlaybackStatus = data;
    io.emit(UPDATE_PLAYBACK, data);
  });

  storage.on(STOP_PLAYBACK, data => {
    storage.lastPlaybackStatus = data;
    io.emit(RELOAD_FILES);
  });

  storage.on(USER_SCREENSHOT, () => {
    // https://github.com/info-beamer/tools/tree/master/screenshot
    exec(`DISPLAY=:0 /home/pi/tools/screenshot/screenshot > ${screenshotPath}/${new Date().toISOString()}.jpg`);
  });

  storage.on(USER_SCREEN_OFF, () => {
    exec(`DISPLAY=:0 xset dpms force suspend`);
  });

  storage.on(USER_OPEN_BROWSER, () => {
    exec(`DISPLAY=:0 xdg-open "http://localhost:${port}/" &`);
  });

  io.on('connection', socket => {
    socket.emit(UPDATE_PLAYBACK, storage.lastPlaybackStatus);

    socket.on(USER_PAUSE_MEDIA, () => storage.emit(USER_KEY_PRESS, OMX_KEYS.pause));
    socket.on(USER_CLOSE, () => storage.emit(USER_KEY_PRESS, OMX_KEYS.stop));
  });

  const announceFsUpdate = () => {
    services
      .filesService
      .renewFindFiles()
      .then(() => io.emit(RELOAD_FILES))
      .catch(err => report(err));
  };

  chokidar
    .watch(mediaPath, {
      ignored: /\.part$/,
      persistent: true,
      ignoreInitial: true
    })
    .on('all', throttle(announceFsUpdate, 30000));

  return storage;
}

export default Bus;

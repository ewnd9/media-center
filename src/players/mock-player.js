import Promise from 'bluebird';
import notifier from 'node-notifier';

import storage from './../storage';

import {
  UPDATE_PLAYBACK,
  STOP_PLAYBACK,
  USER_PAUSE_MEDIA,
  USER_CLOSE,
  PLAYING,
  PAUSED,
  STOPPED
} from './../constants';

const notify = message => {
  notifier.notify({
    title: 'MOCK PLAYER',
    message
  });
};

let loopInterval;

const pausePlaying = () => {
  if (loopInterval) {
    clearInterval(loopInterval);
  }
};


export default (trakt, addToHistory, db, media, file, prevPosition) => {
  pausePlaying();

  return Promise
    .resolve()
    .then(() => {
      let position = 0;
      let duration = 100 * 60 * 1000 * 1000; // 100 minutes
      let status = PLAYING;

      const getInfo = () => ({
        progress: position / duration * 100,
        position,
        duration,
        media,
        status
      });

      const emitUpdate = () => storage.emit(UPDATE_PLAYBACK, getInfo());

      const startPlaying = () => {
        pausePlaying();

        loopInterval = setInterval(() => {
          position = position + 1000 * 1000; // 1 second
          emitUpdate();
        }, 1000);
      };

      startPlaying();
      notify(`START PLAYING ${file} ${prevPosition ? 'from ' + prevPosition : ''}`);

      const onPause = () => {
        if (status === PLAYING) {
          status = PAUSED;
          pausePlaying();
        } else {
          status = PLAYING;
          startPlaying();
        }

        notify(`NEW STATUS ${status}`);

        emitUpdate();
      };

      storage.on(USER_PAUSE_MEDIA, onPause);

      const onClose = () => {
        status = STOPPED;
        pausePlaying();

        emitUpdate();
        storage.emit(STOP_PLAYBACK, getInfo());

        notify(`CLOSE MEDIA`);

        storage.removeListener(USER_PAUSE_MEDIA, onPause);
        storage.removeListener(USER_CLOSE, onClose);
      };

      storage.on(USER_CLOSE, onClose);

      return { getInfo };
    });
};

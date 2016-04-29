import fkill from 'fkill';
import exitHook from 'exit-hook';

import OMXPlayer from './../vendor/omxplayer';

import storage from './../storage';

import {
  UPDATE_PLAYBACK,
  STOP_PLAYBACK,
  PLAYING,
  PAUSED,
  STOPPED,
  USER_KEY_PRESS
} from './../constants';

import { registerKeys, unregisterKeys } from './../x11';

let omxplayer = null;

const killProcess = () => {
  unregisterKeys();
  return fkill('omxplayer.bin').then(() => console.log('success'), err => console.log(err));
};

exitHook(killProcess);

storage.on(USER_KEY_PRESS, key => {
  if (omxplayer) {
    omxplayer._omxProcess.stdin.write(key);
  }
});

const tr = h => h < 10 ? ('0' + h) : ('' + h);

export function startOmxPlayer(file, prevPosition, listeners = {}) {
  return killProcess().then(registerKeys).then(() => {
    const configuration = {
      omxPlayerParams: ['--no-osd']
    };

    if (prevPosition) {
      const seconds = prevPosition / 1000 / 1000;
      const positionTime = `${tr(seconds / 60 / 60 | 0)}:${tr(seconds / 60 | 0)}:${tr(seconds % 60 | 0)}`;

      configuration.omxPlayerParams = configuration.omxPlayerParams.concat(['--pos', positionTime]);
    }

    omxplayer = new OMXPlayer(configuration);

    let duration = 0;
    let position = 0;
    let status;

    const progress = () => position / duration * 100;

    const getInfo = () => {
      const result = {
        progress: progress(),
        position,
        duration,
        status,
        file
      };

      return listeners.getInfo && listeners.getInfo(result) || result;
    };

    const emitUpdate = () => storage.emit(UPDATE_PLAYBACK, getInfo());

    const emitPlay = () => {
      listeners.onPlay && listeners.onPlay(progress());
      emitUpdate();
    };

    const emitPause = () => {
      listeners.onPause && listeners.onPause(progress());
      emitUpdate();
    };

    const emitStop = () => {
      listeners.onStop && listeners.onStop(progress());
      emitUpdate();
      storage.emit(STOP_PLAYBACK);
    };

    omxplayer.start(file, err => {
      if (err) {
        console.log(err);
      }

      setTimeout(emitPlay, 1000);
    });

    omxplayer.on('prop:Duration', _duration => {
      duration = _duration;
    });

    let positionCount = 0;

    omxplayer.on('prop:Position', _position => {
      position = _position;
      emitUpdate();

      if (positionCount % 10 === 0) {
        // @TODO replace with debounce
        listeners.onPositionUpdate && listeners.onPositionUpdate(position, duration);
      }

      positionCount = (positionCount + 1) % 10;
    });

    omxplayer.on('prop:PlaybackStatus', omxStatus => {
      if (omxStatus === 'Playing') {
        status = PLAYING;
        emitPlay();
      } else if (omxStatus === 'Paused') {
        status = PAUSED;
        emitPause();
      }
    });

    omxplayer.on('stopped', () => {
      status = STOPPED;
      emitStop();
      killProcess();
    });

    return { getInfo };
  });
}

export default (trakt, addToHistory, db, media, file, prevPosition) => {
  const listeners = {
    onPlay: progress => trakt.startScrobble(media, progress),
    onPause: progress => trakt.pauseScrobble(media, progress),
    onStop: progress => trakt.pauseScrobble(media, progress),
    getInfo: result => ({ ...result, media }),
    onPositionUpdate: (position, duration) => {
      db.File
        .update(file, { position, duration })
        .then(res => {
          const pos = position / duration * 100;

          if (!res.scrobble && pos !== Infinity && pos > 80) {
            addToHistory(file, media);
          }
        });
    }
  };

  return startOmxPlayer(file, prevPosition, listeners);
};

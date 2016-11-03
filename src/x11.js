import storage from './storage';

import {
  USER_SCREENSHOT,
  USER_SCREEN_OFF,
  USER_OPEN_BROWSER,
  USER_KEY_PRESS,
  USER_ANALYTICS,
  OMX_KEYS
} from './constants';

import x11 from 'x11';
import _ from 'lodash';

const noKeyModifier = 0;
// const ctrlKeyModifier = 4;

const playerEvents = {};
const globalEvents = {};
const keyPressEvents = {};

playerEvents[52] = USER_SCREENSHOT; // z
playerEvents[56] = USER_ANALYTICS; // b

keyPressEvents[10] = OMX_KEYS.decreaseSpeed; // 1
keyPressEvents[11] = OMX_KEYS.increaseSpeed; // 2
keyPressEvents[44] = OMX_KEYS.previousAudioStream; // j
keyPressEvents[45] = OMX_KEYS.nextAudioStream; // k
keyPressEvents[32] = OMX_KEYS.nextChapter; // o

keyPressEvents[57] = OMX_KEYS.previousSubtitleStream; // n
keyPressEvents[58] = OMX_KEYS.nextSubtitleStream; // m
keyPressEvents[39] = OMX_KEYS.toggleSubtitles; // s
keyPressEvents[40] = OMX_KEYS.decreaseSubtitleDelay; // d
keyPressEvents[41] = OMX_KEYS.increaseSubtitleDelay; // f

keyPressEvents[33] = OMX_KEYS.pause; // p
keyPressEvents[65] = OMX_KEYS.pause; // space
keyPressEvents[24] = OMX_KEYS.stop; // q
keyPressEvents[9] = OMX_KEYS.stop; // esc

keyPressEvents[20] = OMX_KEYS.decreaseVolume; // -
keyPressEvents[112] = OMX_KEYS.increaseVolume; // pgdn
keyPressEvents[21] = OMX_KEYS.increaseVolume; // +
keyPressEvents[117] = OMX_KEYS.decreaseVolume; // pgup

keyPressEvents[113] = OMX_KEYS.seekBackward;
keyPressEvents[114] = OMX_KEYS.seekForward;
keyPressEvents[116] = OMX_KEYS.seekFastBackward;
keyPressEvents[111] = OMX_KEYS.seekFastForward;

globalEvents[73] = USER_SCREEN_OFF; // F7
globalEvents[74] = USER_OPEN_BROWSER; // F8

const pointerMode = false;
const keyboardMode = true;

let X;
let root;

const grabKeys = events => {
  _.map(events, (event, key) => {
    X.GrabKey(root, 0, noKeyModifier, key, pointerMode, keyboardMode);
  });
};

export const registerEvents = events => {
  if (!X) {
    return new Promise((resolve, reject) => {
      x11.createClient(function(err, display) {
        if (err) {
          reject(err);
        }

        X = display.client;
        root = display.screen[0].root;

        grabKeys(events);
        resolve();
      }).on('event', function(event) {
        const action =
          playerEvents[event.keycode] ||
          globalEvents[event.keycode] ||
          keyPressEvents[event.keycode];

        console.log(event.name, event.keycode, action);

        if (event.name === 'KeyPress') {
          if (action === keyPressEvents[event.keycode]) {
            storage.emit(USER_KEY_PRESS, action);
          } else {
            storage.emit(action);
          }
        }
      });
    });
  } else {
    grabKeys(events);
    return Promise.resolve();
  }
};

export const registerKeys = () => {
  registerEvents(playerEvents);
  registerEvents(keyPressEvents);
};


if (process.env.NODE_ENV === 'production' && !process.env.NODE_DISABLE_X11_SUPPORT) {
  registerEvents(globalEvents);
}

export const unregisterEvents = events => {
  if (X) {
    _.map(events, (event, key) => {
      X.UngrabKey(root, key, 0);
    });
  }
};

export const unregisterKeys = () => {
  unregisterEvents(playerEvents);
  unregisterEvents(keyPressEvents);
};

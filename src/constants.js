export const UPDATE_PLAYBACK = 'UPDATE_PLAYBACK';
export const STOP_PLAYBACK = 'STOP_PLAYBACK';

export const USER_PAUSE_MEDIA = 'USER_PAUSE_MEDIA';
export const USER_CLOSE = 'USER_CLOSE';

export const RELOAD_FILES = 'RELOAD_FILES';

export const USER_SCREENSHOT = 'USER_SCREENSHOT';
export const USER_SCREEN_OFF = 'USER_SCREEN_OFF';
export const USER_OPEN_BROWSER = 'USER_OPEN_BROWSER';

export const PLAYING = 'PLAYING';
export const PAUSED = 'PAUSED';
export const STOPPED = 'STOPPED';

export const USER_KEY_PRESS = 'USER_KEY_PRESS';

// copied from https://github.com/xat/omxctrl/blob/master/omxctrl.js
export const OMX_KEYS = {
  decreaseSpeed: '1',
  increaseSpeed: '2',
  previousAudioStream: 'j',
  nextAudioStream: 'k',
  previousChapter: 'i',
  nextChapter: 'o',
  previousSubtitleStream: 'n',
  nextSubtitleStream: 'm',
  toggleSubtitles: 's',
  decreaseSubtitleDelay: 'd',
  increaseSubtitleDelay: 'f',
  pause: 'p', // toggle between pause and play
  stop: 'q',
  decreaseVolume: '-',
  increaseVolume: '+',
  seekForward: "\x5b\x43",
  seekBackward: "\x5b\x44",
  seekFastForward: "\x5b\x41",
  seekFastBackward: "\x5B\x42"
};

import React from 'react';
import { formatTitle } from './../utils';

import {
  PLAYING,
  PAUSED
} from './../constants';

import IconButton from './icon-button';

export default ({ playback, onPlay, onPause, onClose }) => {
  return (
    <div id="playback">
      <IconButton icon="film">
        {playback.progress | 0}{'%'}
        {' '}
        {formatTitle(playback.media)}
      </IconButton>

      { playback.status === PAUSED && (
          <IconButton icon="play" onClick={onPlay}>
            Play
          </IconButton>
      )}
      { playback.status === PLAYING && (
        <IconButton icon="pause" onClick={onPause}>
          Pause
        </IconButton>
      )}

      <IconButton icon="stop" onClick={onClose}>
        Stop
      </IconButton>
    </div>
  );
};

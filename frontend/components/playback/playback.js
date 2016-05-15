import React from 'react';
import styles from './style.css';

import { formatTitle } from '../../utils';

import {
  PLAYING,
  PAUSED
} from '../../constants';

import IconButton from '../ui/icon-button/icon-button';

export default ({ playback, onPlay, onPause, onClose }) => {
  return (
    <div className={styles.container}>
      <IconButton icon="film">
        {playback.progress | 0}{'%'}
        {' '}
        {playback.media && formatTitle(playback.media) || playback.file}
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

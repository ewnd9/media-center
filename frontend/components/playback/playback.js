import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import { formatTitle } from '../../utils';

import {
  STOPPED,
  PLAYING,
  PAUSED
} from '../../constants';

import { emitPlay, emitPause, emitClose } from '../../actions/playback-actions';
import IconButton from '../ui/icon-button/icon-button';

const mapStateToProps = ({ playback: { playback } }) => ({ playback });
const mapDispatchToProps = { emitPlay, emitPause, emitClose };

export const Playback = ({ playback, emitPlay, emitPause, emitClose }) => {
  if (!playback || playback.status === STOPPED) {
    return null;
  }

  return (
    <div className={styles.container}>
      <IconButton icon="film">
        {playback.progress | 0}{'%'}
        {' '}
        {playback.media && formatTitle(playback.media) || playback.file}
      </IconButton>

      { playback.status === PAUSED && (
          <IconButton icon="play" onClick={emitPlay}>
            Play
          </IconButton>
      )}

      { playback.status === PLAYING && (
        <IconButton icon="pause" onClick={emitPause}>
          Pause
        </IconButton>
      )}

      <IconButton icon="stop" onClick={emitClose}>
        Stop
      </IconButton>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Playback);

import React from 'react';
import { formatTitle } from './../utils';

import {
  PLAYING,
  PAUSED
} from './../constants';

export default ({ playback, onPlay, onPause, onClose }) => {
  return (
    <div id="playback">
      <button type="button" className="btn btn-default btn-sm">
        <span className="glyphicon glyphicon-film" aria-hidden="true"></span>
        {' '}
        {playback.progress | 0}{'%'}
        {' '}
        {formatTitle(playback.media)}
      </button>

      { playback.status === PAUSED && (
        <button type="button" className="btn btn-default btn-sm" onClick={onPlay}>
          <span className="glyphicon glyphicon-play" aria-hidden="true"></span> Play
          </button>
        )}
      { playback.status === PLAYING && (
        <button type="button" className="btn btn-default btn-sm" onClick={onPause}>
          <span className="glyphicon glyphicon-pause" aria-hidden="true"></span> Pause
        </button>
      )}

      <button type="button" className="btn btn-default btn-sm" onClick={onClose}>
        <span className="glyphicon glyphicon glyphicon-stop" aria-hidden="true"></span> Stop
      </button>
    </div>
  );
};

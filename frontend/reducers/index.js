import { combineReducers } from 'redux';

import screenshots from './screenshots-reducer';
import youtube from './youtube-reducer';
import traktReport from './trakt-report-reducer';
import files from './files-reducer';
import modal from './modal-reducer';
import movies from './movies-reducer';
import persons from './persons-reducer';
import width from './width-reducer';
import settings from './settings-reducer';

import createPlaybackReducer from './playback-reducer';

export default socket => {
  const rootReducer = combineReducers({
    traktReport,
    screenshots,
    youtube,
    files,
    movies,
    persons,
    width,
    modal,
    settings,
    playback: createPlaybackReducer(socket)
  });

  return rootReducer;
};

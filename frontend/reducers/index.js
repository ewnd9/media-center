import { combineReducers } from 'redux';

import screenshots from './screenshots-reducer';
import mark from './mark-reducer';
import marks from './marks-reducer';
import youtube from './youtube-reducer';
import traktReport from './trakt-report-reducer';
import files from './files-reducer';
import modal from './modal-reducer';

import createPlaybackReducer from './playback-reducer';

export default socket => {
  const rootReducer = combineReducers({
    traktReport,
    screenshots,
    mark,
    marks,
    youtube,
    files,
    modal,
    playback: createPlaybackReducer(socket)
  });

  return rootReducer;
};

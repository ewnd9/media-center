import { combineReducers } from 'redux';

import screenshots from './screenshots-reducer';
import mark from './mark-reducer';
import youtube from './youtube-reducer';
import traktReport from './trakt-report-reducer';

const rootReducer = combineReducers({
  traktReport,
  screenshots,
  mark,
  youtube
});

export default rootReducer;

import { combineReducers } from 'redux';

import screenshots from './screenshots-reducer';
import mark from './mark-reducer';
import youtube from './youtube-reducer';

const rootReducer = combineReducers({
  screenshots,
  mark,
  youtube
});

export default rootReducer;

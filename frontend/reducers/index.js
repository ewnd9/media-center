import { combineReducers } from 'redux';

import screenshots from './screenshots-reducer';
import mark from './mark-reducer';

const rootReducer = combineReducers({
  screenshots,
  mark
});

export default rootReducer;

import { createCheckedReducer } from './utils';
import t from 'tcomb';
import moment from 'moment';

import {
  TRAKT_REPORT_REQUEST,
  TRAKT_REPORT_SUCCESS,
  TRAKT_REPORT_FAILURE,

  FETCH_SHOW_REQUEST,
  FETCH_SHOW_SUCCESS,
  FETCH_SHOW_FAILURE
} from '../actions/trakt-report-actions';

export const schema = t.struct({
  isFetching: t.Boolean,
  report: t.maybe(t.list(t.Object)),
  show: t.maybe(t.Object)
});

export default createCheckedReducer({
  isFetching: false,
  report: null,
  show: null
}, {
  [TRAKT_REPORT_REQUEST](state) {
    return {
      ...state,
      isFetching: true
    };
  },
  [TRAKT_REPORT_SUCCESS](state, action) {
    const { report } = action.response;

    report.forEach(report => {
      report.episodes.forEach(ep => {
        // average american show air time
        ep.air_date = moment(`${ep.air_date} 22:00 -05:00`, 'YYYY-MM-DD HH:mm Z').toISOString();
      });
    });

    return {
      ...state,
      isFetching: false,
      report
    };
  },
  [TRAKT_REPORT_FAILURE](state) {
    return {
      ...state,
      isFetching: false
    };
  },
  [FETCH_SHOW_REQUEST](state) {
    return {
      ...state
    };
  },
  [FETCH_SHOW_SUCCESS](state, action) {
    return {
      ...state,
      show: action.response.show
    };
  },
  [FETCH_SHOW_FAILURE](state) {
    return {
      ...state
    };
  },
}, schema);

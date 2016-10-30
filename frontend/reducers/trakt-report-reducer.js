import {
  REQUEST_TRAKT_REPORT,
  RECIEVE_TRAKT_REPORT
} from '../actions/trakt-report-actions';

function traktReport(state = {
  isFetching: false,
  report: null
}, action) {
  switch (action.type) {
    case REQUEST_TRAKT_REPORT:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_TRAKT_REPORT:
      return {
        ...state,
        isFetching: false,
        report: action.report
      };
    default:
      return state;
  }
}

export default traktReport;

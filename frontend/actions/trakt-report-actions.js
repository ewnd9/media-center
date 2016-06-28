import * as api from '../api';

export const REQUEST_TRAKT_REPORT = 'REQUEST_TRAKT_REPORT';
export const RECIEVE_TRAKT_REPORT = 'RECIEVE_TRAKT_REPORT';

function requestTraktReport() {
  return {
    type: REQUEST_TRAKT_REPORT
  };
}

function recieveTraktReport(report) {
  return {
    type: RECIEVE_TRAKT_REPORT,
    report
  };
}

export function fetchTraktReport() {
  return dispatch => {
    dispatch(requestTraktReport());

    return api
      .getReport()
      .then(report => {
        return dispatch(recieveTraktReport(report.filter(_ => _.length > 0)));
      });
  };
}

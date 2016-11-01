import * as api from '../api';

export const TRAKT_REPORT_REQUEST = 'TRAKT_REPORT_REQUEST';
export const TRAKT_REPORT_SUCCESS = 'TRAKT_REPORT_SUCCESS';
export const TRAKT_REPORT_FAILURE = 'TRAKT_REPORT_FAILURE';

export const FETCH_SHOW_REQUEST = 'FETCH_SHOW_REQUEST';
export const FETCH_SHOW_SUCCESS = 'FETCH_SHOW_SUCCESS';
export const FETCH_SHOW_FAILURE = 'FETCH_SHOW_FAILURE';

export function fetchTraktReport() {
  return {
    types: [TRAKT_REPORT_REQUEST, TRAKT_REPORT_SUCCESS, TRAKT_REPORT_FAILURE],
    callAPI: () => api.getReport()
  };
}

export function fetchShow(imdb) {
  return {
    types: [FETCH_SHOW_REQUEST, FETCH_SHOW_SUCCESS, FETCH_SHOW_FAILURE],
    callAPI: () => api.getShow(imdb),
    payload: { imdb }
  };
}

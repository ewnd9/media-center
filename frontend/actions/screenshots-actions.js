export const FETCH_SCREENSHOTS_REQUEST = 'FETCH_SCREENSHOTS_REQUEST';
export const FETCH_SCREENSHOTS_SUCCESS = 'FETCH_SCREENSHOTS_SUCCESS';
export const FETCH_SCREENSHOTS_FAILURE = 'FETCH_SCREENSHOTS_FAILURE';

export function fetchScreenshots() {
  return {
    types: [
      FETCH_SCREENSHOTS_REQUEST,
      FETCH_SCREENSHOTS_SUCCESS,
      FETCH_SCREENSHOTS_FAILURE
    ],
    callAPI: ({ api }) => api.getScreenshots()
  };
}

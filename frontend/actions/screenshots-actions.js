import * as api from '../api';

export const REQUEST_SCREENSHOTS = 'REQUEST_SCREENSHOTS';
export const RECIEVE_SCREENSHOTS = 'RECIEVE_SCREENSHOTS';

function requestScreenshots() {
  return {
    type: REQUEST_SCREENSHOTS
  };
}

function recieveScreenshots(screenshots) {
  return {
    type: RECIEVE_SCREENSHOTS,
    screenshots
  };
}

export function fetchScreenshots() {
  return dispatch => {
    dispatch(requestScreenshots());

    return api
      .getScreenshots()
      .then(({ files }) => {
        return dispatch(recieveScreenshots(files));
      });
  };
}

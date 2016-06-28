import * as api from '../api';

export const REQUEST_MARKS = 'REQUEST_MARKS';
export const RECIEVE_MARKS = 'RECIEVE_MARKS';

function requestMarks(since) {
  return {
    type: REQUEST_MARKS,
    since
  };
}

function recieveMarks(marks) {
  return {
    type: RECIEVE_MARKS,
    marks
  };
}

export function fetchMarks(since) {
  return dispatch => {
    dispatch(requestMarks(since));

    return api
      .getMarks(since)
      .then(marks => dispatch(recieveMarks(marks)));
  };
}

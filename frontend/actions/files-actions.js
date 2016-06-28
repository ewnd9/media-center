import * as api from '../api';

export const REQUEST_FILES = 'REQUEST_FILES';
export const RECIEVE_FILES = 'RECIEVE_FILES';

function requestFiles() {
  return {
    type: REQUEST_FILES
  };
}

function recieveFiles(files) {
  return {
    type: RECIEVE_FILES,
    files
  };
}

export function fetchFiles() {
  return dispatch => {
    dispatch(requestFiles());

    return api
      .findFiles()
      .then(files => dispatch(recieveFiles(files)));
  };
}

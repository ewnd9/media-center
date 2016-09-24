import * as api from '../api';

export const REQUEST_FILES = 'REQUEST_FILES';
export const RECIEVE_FILES = 'RECIEVE_FILES';

export const PLAY_FILE_REQUEST = 'PLAY_FILE_REQUEST';
export const PLAY_FILE_SUCCESS = 'PLAY_FILE_SUCCESS';

export const ADD_TO_HISTORY_REQUEST = 'ADD_TO_HISTORY_REQUEST';
export const ADD_TO_HISTORY_SUCCESS = 'ADD_TO_HISTORY_SUCCESS';

export const DELETE_FILE_REQUEST = 'DELETE_FILE_REQUEST';
export const DELETE_FILE_SUCCESS = 'DELETE_FILE_SUCCESS';

export const SAVE_INFO_REQUEST = 'SAVE_INFO_REQUEST';
export const SAVE_INFO_SUCCESS = 'SAVE_INFO_SUCCESS';

export const SET_HIDDEN_REQUEST = 'SET_HIDDEN_REQUEST';
export const SET_HIDDEN_SUCCESS = 'SET_HIDDEN_SUCCESS';

export const FILES_SET_ACTIVE_KEY = 'FILES_SET_ACTIVE_KEY';

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

export function playFile(file, db, position, noScrobble) {
  return dispatch => {
    dispatch({ type: PLAY_FILE_REQUEST });

    return api
      .playFile(file, db, position, noScrobble)
      .then(() => dispatch({ type: PLAY_FILE_SUCCESS }));
  };
}

export function saveInfo(file, db) {
  return dispatch => {
    dispatch({ type: SAVE_INFO_REQUEST });

    return api
      .saveInfo(file, db)
      .then(() => dispatch({ type: SAVE_INFO_SUCCESS }));
  };
}

export function setHidden(file, filename) {
  return dispatch => {
    dispatch({ type: SET_HIDDEN_REQUEST });

    return api
      .setHidden(file, filename)
      .then(() => dispatch({ type: SET_HIDDEN_SUCCESS }));
  };
}

export function addToHistory(file) {
  return dispatch => {
    dispatch({ type: ADD_TO_HISTORY_REQUEST, file });

    return api
      .addToHistory(file.file, file.db)
      .then(() => {
        dispatch({ type: ADD_TO_HISTORY_SUCCESS });

        return fetchFiles()(dispatch);
      });
  };
}

export function deleteFile(file) {
  return dispatch => {
    dispatch({ type: DELETE_FILE_REQUEST, file });

    return api
      .deleteFile(file.file)
      .then(() => {
        dispatch({ type: DELETE_FILE_SUCCESS });

        return fetchFiles()(dispatch);
      });
  };
}

export function setActiveKey(activeKey) {
  return {
    type: FILES_SET_ACTIVE_KEY,
    activeKey
  };
}

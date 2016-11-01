import * as api from '../api';

export const FETCH_FILES_REQUEST = 'FETCH_FILES_REQUEST';
export const FETCH_FILES_SUCCESS = 'FETCH_FILES_SUCCESS';
export const FETCH_FILES_FAILURE = 'FETCH_FILES_FAILURE';

export const PLAY_FILE_REQUEST = 'PLAY_FILE_REQUEST'; // no reducers involved
export const PLAY_FILE_SUCCESS = 'PLAY_FILE_SUCCESS';
export const PLAY_FILE_FAILURE = 'PLAY_FILE_FAILURE';

export const SAVE_INFO_REQUEST = 'SAVE_INFO_REQUEST'; // no reducers involved
export const SAVE_INFO_SUCCESS = 'SAVE_INFO_SUCCESS';
export const SAVE_INFO_FAILURE = 'SAVE_INFO_FAILURE';

export const SET_HIDDEN_REQUEST = 'SET_HIDDEN_REQUEST'; // no reducers involved
export const SET_HIDDEN_SUCCESS = 'SET_HIDDEN_SUCCESS';
export const SET_HIDDEN_FAILURE = 'SET_HIDDEN_FAILURE';

export const ADD_TO_HISTORY_REQUEST = 'ADD_TO_HISTORY_REQUEST';
export const ADD_TO_HISTORY_SUCCESS = 'ADD_TO_HISTORY_SUCCESS';
export const ADD_TO_HISTORY_FAILURE = 'ADD_TO_HISTORY_FAILURE';

export const DELETE_FILE_REQUEST = 'DELETE_FILE_REQUEST';
export const DELETE_FILE_SUCCESS = 'DELETE_FILE_SUCCESS';
export const DELETE_FILE_FAILURE = 'DELETE_FILE_FAILURE';

export const FILES_SET_ACTIVE_KEY = 'FILES_SET_ACTIVE_KEY';

export function fetchFiles() {
  return {
    types: [FETCH_FILES_REQUEST, FETCH_FILES_SUCCESS, FETCH_FILES_FAILURE],
    callAPI: () => api.findFiles()
  };
}

export function playFile(file, db, position, noScrobble) {
  return {
    types: [PLAY_FILE_REQUEST, PLAY_FILE_SUCCESS, PLAY_FILE_FAILURE],
    callAPI: () => api.playFile(file, db, position, noScrobble),
    payload: { file, db, position, noScrobble }
  };
}

export function saveInfo(file, db) {
  return {
    types: [SAVE_INFO_REQUEST, SAVE_INFO_SUCCESS, SAVE_INFO_FAILURE],
    callAPI: () => api.saveInfo(file, db),
    payload: { file, db }
  };
}

export function setHidden(file, filename) {
  return {
    types: [SET_HIDDEN_REQUEST, SET_HIDDEN_SUCCESS, SET_HIDDEN_FAILURE],
    callAPI: () => api.setHidden(file, filename),
    payload: { file, filename }
  };
}

export function addToHistory({ file, db }) {
  return dispatch => {
    const action = {
      types: [ADD_TO_HISTORY_REQUEST, ADD_TO_HISTORY_SUCCESS, ADD_TO_HISTORY_FAILURE],
      callAPI: () => api.addToHistory(file, db),
      payload: { file, db }
    };

    return dispatch(action)
      .then(() => dispatch(fetchFiles()));
  };
}

export function deleteFile({ file }) {
  return dispatch => {
    const action = {
      types: [DELETE_FILE_REQUEST, DELETE_FILE_SUCCESS, DELETE_FILE_FAILURE],
      callAPI: () => api.deleteFile(file),
      payload: { file }
    };

    return dispatch(action)
      .then(() => dispatch(fetchFiles()));
  };
}

export function setActiveKey(activeKey) {
  return {
    type: FILES_SET_ACTIVE_KEY,
    activeKey
  };
}

import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  FETCH_FILES_REQUEST,
  FETCH_FILES_SUCCESS,
  FETCH_FILES_FAILURE,

  ADD_TO_HISTORY_REQUEST,
  ADD_TO_HISTORY_SUCCESS,
  ADD_TO_HISTORY_FAILURE,

  DELETE_FILE_REQUEST,
  DELETE_FILE_SUCCESS,
  DELETE_FILE_FAILURE,

  FILES_SET_ACTIVE_KEY
} from '../actions/files-actions';

export const schema = t.struct({
  isFetching: t.Boolean,
  files: t.list(t.Object),
  activeKey: t.maybe(t.String),
  addToHistoryKeyInProgress: t.maybe(t.String),
  deleteFileKeyInProgress: t.maybe(t.String)
});

export default createCheckedReducer({
  isFetching: false,
  files: [],
  activeKey: null,
  addToHistoryKeyInProgress: null,
  deleteFileKeyInProgress: null
}, {
  [FETCH_FILES_REQUEST](state) {
    return {
      ...state,
      isFetching: true
    };
  },
  [FETCH_FILES_SUCCESS](state, action) {
    return {
      ...state,
      isFetching: false,
      files: action.response
    };
  },
  [FETCH_FILES_FAILURE](state) {
    return {
      ...state,
      isFetching: false
    };
  },

  [ADD_TO_HISTORY_REQUEST](state, action) {
    return {
      ...state,
      addToHistoryKeyInProgress: action.file
    };
  },
  [ADD_TO_HISTORY_SUCCESS](state) {
    return {
      ...state,
      addToHistoryKeyInProgress: null
    };
  },
  [ADD_TO_HISTORY_FAILURE](state) {
    return {
      ...state,
      addToHistoryKeyInProgress: null
    };
  },

  [DELETE_FILE_REQUEST](state, action) {
    return {
      ...state,
      deleteFileKeyInProgress: action.file
    };
  },
  [DELETE_FILE_SUCCESS](state) {
    return {
      ...state,
      deleteFileKeyInProgress: null
    };
  },
  [DELETE_FILE_FAILURE](state) {
    return {
      ...state,
      deleteFileKeyInProgress: null
    };
  },

  [FILES_SET_ACTIVE_KEY](state, action) {
    return {
      ...state,
      activeKey: action.activeKey === state.activeKey ? null : action.activeKey
    };
  }
}, schema);

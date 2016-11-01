import * as api from '../api';
import { fetchFiles } from './files-actions';

export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

export const FETCH_MODAL_SUGGESTIONS_REQUEST = 'FETCH_MODAL_SUGGESTIONS_REQUEST';
export const FETCH_MODAL_SUGGESTIONS_SUCCESS = 'FETCH_MODAL_SUGGESTIONS_SUCCESS';
export const FETCH_MODAL_SUGGESTIONS_FAILURE = 'FETCH_MODAL_SUGGESTIONS_FAILURE';

export const MODAL_SUGGESTIONS_SELECT = 'MODAL_SUGGESTIONS_SELECT';
export const MODAL_CHANGE_FIELD = 'MODAL_CHANGE_FIELD';

export function openModal(file) {
  return {
    type: OPEN_MODAL,
    file
  };
}

export function closeModal() {
  return dispatch => {
    dispatch({ type: CLOSE_MODAL });
    return dispatch(fetchFiles());
  };
}

export function fetchSuggestions(mediaType, suggestionSearchTitle) {
  return {
    types: [
      FETCH_MODAL_SUGGESTIONS_REQUEST,
      FETCH_MODAL_SUGGESTIONS_SUCCESS,
      FETCH_MODAL_SUGGESTIONS_FAILURE
    ],
    callAPI: () => api.getMediaSuggestion(mediaType, suggestionSearchTitle),
    payload: { mediaType, suggestionSearchTitle }
  };
}

export function selectSuggestion(value, label) {
  return {
    type: MODAL_SUGGESTIONS_SELECT,
    value,
    label
  };
}

export function changeField(field, value) {
  return {
    type: MODAL_CHANGE_FIELD,
    field,
    value
  };
}

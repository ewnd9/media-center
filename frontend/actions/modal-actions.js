import * as api from '../api';
import { fetchFiles } from './files-actions';

export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

export const REQUEST_MODAL_SUGGESTIONS = 'REQUEST_MODAL_SUGGESTIONS';
export const RECIEVE_MODAL_SUGGESTIONS = 'RECIEVE_MODAL_SUGGESTIONS';

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
    return fetchFiles()(dispatch);
  };
}

export function fetchSuggestions(type, value) {
  return dispatch => {
    dispatch({ type: REQUEST_MODAL_SUGGESTIONS, suggestionSearchTitle: value });

    return api
      .getMediaSuggestion(type, value)
      .then(suggestions =>
        dispatch({
          type: RECIEVE_MODAL_SUGGESTIONS,
          suggestions,
          suggestionSearchTitle: value
        })
      );
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

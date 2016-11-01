import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  OPEN_MODAL,
  CLOSE_MODAL,

  FETCH_MODAL_SUGGESTIONS_REQUEST,
  FETCH_MODAL_SUGGESTIONS_SUCCESS,
  FETCH_MODAL_SUGGESTIONS_FAILURE,

  MODAL_SUGGESTIONS_SELECT,
  MODAL_CHANGE_FIELD
} from '../actions/modal-actions';

export const schema = t.struct({
  isOpened: t.Boolean,
  isFetching: t.Boolean,
  isValid: t.Boolean,
  file: t.maybe(t.Object),
  type: t.enums.of(['movie', 'show']),
  s: t.maybe(t.Number),
  ep: t.maybe(t.Number),
  suggestions: t.list(t.Object),
  suggestionSearchTitle: t.maybe(t.String),
  suggestionIsValid: t.Boolean,
  suggestionSelectedValue: t.maybe(t.String),
  suggestionSelectedLabel: t.maybe(t.String)
});

export default createCheckedReducer({
  isOpened: false,
  isFetching: false,
  isValid: false,
  file: null,
  type: 'movie',
  s: null,
  ep: null,
  suggestions: [],
  suggestionSearchTitle: null,
  suggestionIsValid: false,
  suggestionSelectedValue: null,
  suggestionSelectedLabel: null
}, {
  [OPEN_MODAL](state, action) {
    return isValid({
      ...state,
      isOpened: true,
      file: action.file
    });
  },
  [CLOSE_MODAL](state) {
    return isValid({
      ...state,
      isOpened: false,
      file: null
    });
  },
  [FETCH_MODAL_SUGGESTIONS_REQUEST](state, action) {
    return isValid({
      ...state,
      isFetching: true,
      suggestionSearchTitle: action.suggestionSearchTitle,
      suggestionIsValid: false,
      suggestionSelectedValue: null,
      suggestionSelectedLabel: null
    });
  },
  [FETCH_MODAL_SUGGESTIONS_SUCCESS](state, action) {
    if (action.suggestionSearchTitle === state.suggestionSearchTitle) {
      return isValid({
        ...state,
        isFetching: false,
        suggestions: action.response,
        suggestionSearchTitle: action.suggestionSearchTitle,
        suggestionIsValid: false,
        suggestionSelectedValue: null,
        suggestionSelectedLabel: null
      });
    } else {
      return isValid({
        ...state,
        isFetching: false,
        suggestions: [],
        suggestionIsValid: false,
        suggestionSelectedValue: null,
        suggestionSelectedLabel: null
      });
    }
  },
  [FETCH_MODAL_SUGGESTIONS_FAILURE](state) {
    return isValid({
      ...state,
      isFetching: false,
      suggestions: [],
      suggestionIsValid: false,
      suggestionSelectedValue: null,
      suggestionSelectedLabel: null
    });
  },
  [MODAL_SUGGESTIONS_SELECT](state, action) {
    return isValid({
      ...state,
      suggestionIsValid: true,
      suggestionSelectedValue: action.value,
      suggestionSelectedLabel: action.label
    });
  },
  [MODAL_CHANGE_FIELD](state, action) {
    return isValid({
      ...state,
      [action.field]: action.field === 's' || action.field === 'ep' ? +action.value : action.value
    });
  }
}, schema);

function isValid(state) {
  const isValid = !!(state.suggestionSelectedValue && state.type !== 'show' || (state.s && state.ep));

  return {
    ...state,
    isValid
  };
}

import {
  OPEN_MODAL,
  CLOSE_MODAL,
  REQUEST_MODAL_SUGGESTIONS,
  RECIEVE_MODAL_SUGGESTIONS,
  MODAL_SUGGESTIONS_SELECT,
  MODAL_CHANGE_FIELD
} from '../actions/modal-actions';

function modal(state = {
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
}, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return isValid({
        ...state,
        isOpened: true,
        file: action.file
      });
    case CLOSE_MODAL:
      return isValid({
        ...state,
        isOpened: false,
        file: null
      });
    case REQUEST_MODAL_SUGGESTIONS:
      return isValid({
        ...state,
        isFetching: true,
        suggestionSearchTitle: action.suggestionSearchTitle,
        suggestionIsValid: false,
        suggestionSelectedValue: null,
        suggestionSelectedLabel: null
      });
    case RECIEVE_MODAL_SUGGESTIONS:
      if (action.suggestionSearchTitle === state.suggestionSearchTitle) {
        return isValid({
          ...state,
          isFetching: false,
          suggestions: action.suggestions,
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
    case MODAL_SUGGESTIONS_SELECT:
      return isValid({
        ...state,
        suggestionIsValid: true,
        suggestionSelectedValue: action.value,
        suggestionSelectedLabel: action.label
      });
    case MODAL_CHANGE_FIELD:
      return isValid({
        ...state,
        [action.field]: action.value
      });
    default:
      return state;
  }
}

export default modal;

function isValid(state) {
  return {
    ...state,
    isValid: state.suggestionSelectedValue && state.type !== 'show' || (state.s && state.ep)
  };
}

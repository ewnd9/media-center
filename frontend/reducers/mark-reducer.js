import {
  REQUEST_MARK,
  RECIEVE_MARK,
  SHOW_TOOLTIP,
  POST_WORD_SUCCESS,
  RECIEVE_TRANSLATION,
  DELETE_WORD_SUCCESS
} from '../actions/mark-actions';

function mark(state = {
  isFetching: false,
  mark: null,
  active: 0,
  activeTooltipId: null,
  activeBlockIndex: null,
  words: {},
  translations: {}
}, action) {
  switch (action.type) {
    case REQUEST_MARK:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_MARK:
      return recieveMark(state, action);
    case SHOW_TOOLTIP:
      return {
        ...state,
        activeTooltipId: state.activeTooltipId === action.id ? null : action.id,
        activeBlockIndex: state.activeTooltipId === action.id ? null : action.blockIndex
      };
    case POST_WORD_SUCCESS:
      return {
        ...state,
        activeTooltipId: null,
        activeBlockIndex: null,
        words: {
          ...state.words,
          [action.id]: action.word
        }
      };
    case RECIEVE_TRANSLATION:
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.id]: normalizeTranslations(action.translation, action.wordType)
        }
      };
    case DELETE_WORD_SUCCESS:
      return {
        ...state,
        activeTooltipId: null,
        activeBlockIndex: null,
        words: {
          ...state.words,
          [action.id]: null
        }
      };
    default:
      return state;
  }
}

export default mark;

function recieveMark(state, { mark }) {
  return {
    ...state,
    isFetching: false,
    mark
  };
}

function normalizeTranslations(translation, wordType) {
  if (translation.type === 'dictionary') {
    if (translation.result[wordType]) {
      return translation.result[wordType].translations
        .map(tr => ({
          translation: tr.translation,
          synonyms: tr.synonyms
        }));
    }
  }

  return [];
}

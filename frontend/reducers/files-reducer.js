import {
  REQUEST_FILES,
  RECIEVE_FILES,
  FILES_SET_ACTIVE_KEY,
  ADD_TO_HISTORY_REQUEST,
  ADD_TO_HISTORY_SUCCESS
} from '../actions/files-actions';

function files(state = {
  isFetching: false,
  files: [],
  activeKey: null,
  addToHistoryKeyInProgress: null
}, action) {
  switch (action.type) {
    case REQUEST_FILES:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_FILES:
      return {
        ...state,
        isFetching: false,
        files: action.files
      };
    case ADD_TO_HISTORY_REQUEST:
      return {
        ...state,
        addToHistoryKeyInProgress: action.file.file
      };
    case ADD_TO_HISTORY_SUCCESS:
      return {
        ...state,
        addToHistoryKeyInProgress: null
      };
    case FILES_SET_ACTIVE_KEY:
      return {
        ...state,
        activeKey: action.activeKey === state.activeKey ? null : action.activeKey
      };
    default:
      return state;
  }
}

export default files;

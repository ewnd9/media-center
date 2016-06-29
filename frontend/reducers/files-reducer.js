import { REQUEST_FILES, RECIEVE_FILES, FILES_SET_ACTIVE_KEY } from '../actions/files-actions';

function files(state = {
  isFetching: false,
  files: [],
  activeKey: null
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

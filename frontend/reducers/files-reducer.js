import { REQUEST_FILES, RECIEVE_FILES } from '../actions/files-actions';

function files(state = {
  isFetching: false,
  files: []
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
    default:
      return state;
  }
}

export default files;

import {
  REQUEST_SCREENSHOTS,
  RECIEVE_SCREENSHOTS,
} from '../actions/screenshots-actions';

function screenshots(state = {
  isFetching: false,
  screenshots: []
}, action) {
  switch (action.type) {
    case REQUEST_SCREENSHOTS:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_SCREENSHOTS:
      return {
        ...state,
        isFetching: false,
        screenshots: action.screenshots
      };
    default:
      return state;
  }
};

export default screenshots;

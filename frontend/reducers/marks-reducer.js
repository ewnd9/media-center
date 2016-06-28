import {
  REQUEST_MARKS,
  RECIEVE_MARKS
} from '../actions/marks-actions';

function marks(state = {
  isFetching: false,
  hasInitialLoad: false,
  hasMore: true,
  marks: []
}, action) {
  switch (action.type) {
    case REQUEST_MARKS:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_MARKS:
      return {
        ...state,
        isFetching: false,
        hasInitialLoad: true,
        marks: state.marks.length > 0 ? state.marks.concat(action.marks) : action.marks,
        hasMore: action.marks.length > 0
      };
    default:
      return state;
  }
}

export default marks;

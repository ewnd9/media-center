import {
  REQUEST_MARK,
  RECIEVE_MARK,
  SHOW_TOOLTIP
} from '../actions/mark-actions';

function mark(state = {
  isFetching: false,
  mark: null,
  active: 0,
  activeTooltipId: null,
  activeBlockIndex: null
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

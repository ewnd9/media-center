import {
  OPEN_MODAL,
  CLOSE_MODAL
} from '../actions/modal-actions';

function modal(state = {
  isOpened: false,
  file: null
}, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return {
        ...state,
        isOpened: true,
        file: action.file
      };
    case CLOSE_MODAL:
      return {
        ...state,
        isOpened: false,
        file: null
      };
    default:
      return state;
  }
}

export default modal;

import * as api from '../api';

export const REQUEST_MARK = 'REQUEST_MARK';
export const RECIEVE_MARK = 'RECIEVE_MARK';

export const SHOW_TOOLTIP = 'SHOW_TOOLTIP';

function requestMark(id) {
  return {
    type: REQUEST_MARK,
    id
  };
}

function recieveMark(mark) {
  return {
    type: RECIEVE_MARK,
    mark
  };
}

export function fetchMark(id) {
  return dispatch => {
    dispatch(requestMark(id));

    return api
      .getMark(id)
      .then(mark => {
        return dispatch(recieveMark(mark));
      });
  };
}

export function showTooltip(id) {
  return {
    type: SHOW_TOOLTIP,
    id
  };
}

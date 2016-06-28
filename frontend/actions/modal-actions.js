import { fetchFiles } from './files-actions';

export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

export function openModal(file) {
  return {
    type: OPEN_MODAL,
    file
  };
}

export function closeModal() {
  return dispatch => {
    dispatch({ type: CLOSE_MODAL });
    return fetchFiles()(dispatch);
  };
}

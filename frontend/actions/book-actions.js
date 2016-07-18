export const REQUEST_BOOK = 'REQUEST_BOOK';
export const RECIEVE_BOOK = 'RECIEVE_BOOK';
export const CHANGE_CHAPTER = 'CHANGE_CHAPTER';

import * as api from '../api';

export function fetchBook(id, chapterIndex) {
  return dispatch => {
    dispatch({ type: REQUEST_BOOK, id, chapterIndex });

    return api
      .getBook(id)
      .then(({ book }) => dispatch({ type: RECIEVE_BOOK, book, chapterIndex }));
  };
}

export function changeChapter(index) {
  return {
    type: CHANGE_CHAPTER,
    index
  };
}

import {
  REQUEST_BOOK,
  RECIEVE_BOOK,
  CHANGE_CHAPTER
} from '../actions/book-actions';

export default function(state = {
  isFetching: false,
  book: null,
  chapterIndex: 0
}, action) {
  switch (action.type) {
    case REQUEST_BOOK:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_BOOK:
      return {
        ...state,
        isFetching: false,
        book: action.book
      };
    case CHANGE_CHAPTER:
      return changeChapter(state, action.diff);
    default:
      return state;
  }
}

function changeChapter(state, diff) {
  const { chapterIndex, book: { content: { chapters } } } = state;

  return {
    ...state,
    chapterIndex: (chapterIndex + diff + chapters.length) % chapters.length
  };
}

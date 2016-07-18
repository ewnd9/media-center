import {
  REQUEST_BOOK,
  RECIEVE_BOOK,
  CHANGE_CHAPTER
} from '../actions/book-actions';

import { nlp } from '../shared';

export default function(state = {
  isFetching: false,
  book: null,
  chapter: null,
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
        book: action.book,
        chapter: getChapter(action.book, action.chapterIndex)
      };
    case CHANGE_CHAPTER:
      return {
        ...state,
        chapter: getChapter(state.book, action.index)
      };
    default:
      return state;
  }
}

function getChapter(book, index) {
  const i = index && +index || 1;
  const chapter = book.content.chapters[i - 1];

  return processNlp(chapter);
}

function processNlp(el) {
  return {
    ...el,
    text: el.text && nlp(el.text),
    children: el.children && el.children.map(child => processNlp(child))
  };
}

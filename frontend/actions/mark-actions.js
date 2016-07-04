import * as api from '../api';
import { translate } from '../libs/dictionary-core';

export const REQUEST_MARK = 'REQUEST_MARK';
export const RECIEVE_MARK = 'RECIEVE_MARK';

export const SHOW_TOOLTIP = 'SHOW_TOOLTIP';

export const POST_WORD_REQUEST = 'POST_WORD_REQUEST';
export const POST_WORD_SUCCESS = 'POST_WORD_SUCCESS';

export const DELETE_WORD_REQUEST = 'DELETE_WORD_REQUEST';
export const DELETE_WORD_SUCCESS = 'DELETE_WORD_SUCCESS';

export const REQUEST_TRANSLATION = 'REQUEST_TRANSLATION';
export const RECIEVE_TRANSLATION = 'RECIEVE_TRANSLATION';

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

export function showTooltip(id, blockIndex) {
  return {
    type: SHOW_TOOLTIP,
    id,
    blockIndex
  };
}

function postWordRequest(id, word, example) {
  return {
    type: POST_WORD_REQUEST,
    id,
    word,
    example
  };
}

function postWordSuccess(id, word) {
  return {
    type: POST_WORD_SUCCESS,
    id,
    word
  };
}

export function showTooltipAndFetchTranslations(id, blockIndex, word) {
  return dispatch => {
    dispatch(showTooltip(id, blockIndex));
    dispatch(requestTranslation(id, word));

    return translate('en', 'ru', word)
      .then(translation => dispatch(recieveTranslation(id, word.word, translation)));
  };
}

export function saveWord(id, word, example) {
  return dispatch => {
    dispatch(postWordRequest(id, word, example));

    return api
      .postWord(word, example)
      .then(({ word }) => {
        return dispatch(postWordSuccess(id, word));
      });
  }
}

function deleteWordRequest(id, wordId) {
  return {
    type: DELETE_WORD_REQUEST,
    id,
    wordId
  };
}

function deleteWordSuccess(id, wordId) {
  return {
    type: DELETE_WORD_SUCCESS,
    id,
    wordId
  };
}

export function deleteWord(id, wordId) {
  return dispatch => {
    dispatch(deleteWordRequest(id, wordId));

    return api
      .deleteWord(wordId)
      .then(() => dispatch(deleteWordSuccess(id, wordId)));
  };
}

function requestTranslation(id, word) {
  return {
    type: REQUEST_TRANSLATION,
    id,
    word
  };
}

function recieveTranslation(id, word, translation) {
  return {
    type: RECIEVE_TRANSLATION,
    id,
    word,
    translation
  };
}

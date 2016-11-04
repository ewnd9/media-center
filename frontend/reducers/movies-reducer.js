import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  FETCH_MOVIES_REQUEST,
  FETCH_MOVIES_SUCCESS,
  FETCH_MOVIES_FAILURE,

  FETCH_MOVIE_REQUEST,
  FETCH_MOVIE_SUCCESS,
  FETCH_MOVIE_FAILURE,

  FETCH_DVD_SUGGESTIONS_REQUEST,
  FETCH_DVD_SUGGESTIONS_SUCCESS,
  FETCH_DVD_SUGGESTIONS_FAILURE,

  UPDATE_SUGGESTION_QUERY,
  SHOW_FORM
} from '../actions/movies-actions';

export const schema = t.struct({
  isFetching: t.Boolean,
  showForm: t.Boolean,
  movie: t.maybe(t.Object),
  movies: t.list(t.Object),
  suggestionSearchTitle: t.String,
  suggestions: t.list(t.Object)
});

export default createCheckedReducer({
  isFetching: false,
  showForm: false,
  movie: null,
  movies: [],
  suggestionSearchTitle: '',
  suggestions: []
}, {
  [FETCH_MOVIE_REQUEST](state) {
    return {
      ...state,
      movie: null
    };
  },
  [FETCH_MOVIE_SUCCESS](state, action) {
    return {
      ...state,
      movie: action.response.movie
    };
  },
  [FETCH_MOVIE_FAILURE](state) {
    return {
      ...state,
    };
  },
  [FETCH_MOVIES_REQUEST](state) {
    return {
      ...state,
      isFetching: true
    };
  },
  [FETCH_MOVIES_SUCCESS](state, action) {
    return {
      ...state,
      isFetching: false,
      movies: action.response.movies
    };
  },
  [FETCH_MOVIES_FAILURE](state) {
    return {
      ...state,
      isFetching: false
    };
  },
  [FETCH_DVD_SUGGESTIONS_REQUEST](state) {
    return {
      ...state
    };
  },
  [FETCH_DVD_SUGGESTIONS_SUCCESS](state, action) {
    return {
      ...state,
      suggestions: action.response.suggestions
    };
  },
  [FETCH_DVD_SUGGESTIONS_FAILURE](state) {
    return {
      ...state
    };
  },
  [UPDATE_SUGGESTION_QUERY](state, action) {
    return {
      ...state,
      suggestionSearchTitle: action.query
    };
  },
  [SHOW_FORM](state, action) {
    return {
      ...state,
      showForm: action.value
    };
  }
}, schema);

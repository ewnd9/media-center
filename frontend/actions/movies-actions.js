import * as api from '../api';

export const FETCH_MOVIE_REQUEST = 'FETCH_MOVIE_REQUEST';
export const FETCH_MOVIE_SUCCESS = 'FETCH_MOVIE_SUCCESS';
export const FETCH_MOVIE_FAILURE = 'FETCH_MOVIE_FAILURE';

export const FETCH_MOVIES_REQUEST = 'FETCH_MOVIES_REQUEST';
export const FETCH_MOVIES_SUCCESS = 'FETCH_MOVIES_SUCCESS';
export const FETCH_MOVIES_FAILURE = 'FETCH_MOVIES_FAILURE';

export const FETCH_DVD_SUGGESTIONS_REQUEST = 'FETCH_DVD_SUGGESTIONS_REQUEST';
export const FETCH_DVD_SUGGESTIONS_SUCCESS = 'FETCH_DVD_SUGGESTIONS_SUCCESS';
export const FETCH_DVD_SUGGESTIONS_FAILURE = 'FETCH_DVD_SUGGESTIONS_FAILURE';

export const UPDATE_MOVIE_BY_RELEASE_DATE_REQUEST = 'UPDATE_MOVIE_BY_RELEASE_DATE_REQUEST';
export const UPDATE_MOVIE_BY_RELEASE_DATE_SUCCESS = 'UPDATE_MOVIE_BY_RELEASE_DATE_SUCCESS';
export const UPDATE_MOVIE_BY_RELEASE_DATE_FAILURE = 'UPDATE_MOVIE_BY_RELEASE_DATE_FAILURE';

export const UPDATE_SUGGESTION_QUERY = 'UPDATE_SUGGESTION_QUERY';
export const SHOW_FORM = 'SHOW_FORM';

export function fetchMovie(tmdb, imdb) {
  return {
    types: [FETCH_MOVIE_REQUEST, FETCH_MOVIE_SUCCESS, FETCH_MOVIE_FAILURE],
    callAPI: () => tmdb ? api.getMovieByTmdb(tmdb) : api.getMovie(imdb),
    payload: { tmdb, imdb }
  };
}

export function fetchMovies(type) {
  return {
    types: [FETCH_MOVIES_REQUEST, FETCH_MOVIES_SUCCESS, FETCH_MOVIES_FAILURE],
    callAPI: () => api.getMovies(type),
    payload: { type }
  };
}

export function fetchSuggestions(query) {
  return {
    types: [FETCH_DVD_SUGGESTIONS_REQUEST, FETCH_DVD_SUGGESTIONS_SUCCESS, FETCH_DVD_SUGGESTIONS_FAILURE],
    callAPI: () => api.getDvdReleasesDates(query),
    payload: { query }
  };
}

export function updateMovie(imdb, releaseDate) {
  return dispatch => {
    const action = {
      types: [UPDATE_MOVIE_BY_RELEASE_DATE_REQUEST, UPDATE_MOVIE_BY_RELEASE_DATE_SUCCESS, UPDATE_MOVIE_BY_RELEASE_DATE_FAILURE],
      callAPI: () => api.updateMovieByReleaseDate(imdb, releaseDate),
      payload: { imdb, releaseDate }
    };

    return dispatch(action)
      .then(() => dispatch(fetchMovies()));
  };
}

export function updateSuggestionQuery(query) {
  return { type: UPDATE_SUGGESTION_QUERY, query };
}

export function toggleShowForm(value) {
  return { type: SHOW_FORM, value };
}

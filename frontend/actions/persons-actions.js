export const UPDATE_FAVORITE_STATUS_REQUEST = 'UPDATE_FAVORITE_STATUS_REQUEST';
export const UPDATE_FAVORITE_STATUS_SUCCESS = 'UPDATE_FAVORITE_STATUS_SUCCESS';
export const UPDATE_FAVORITE_STATUS_FAILURE = 'UPDATE_FAVORITE_STATUS_FAILURE';

export const FETCH_PERSON_REQUEST = 'FETCH_PERSON_REQUEST';
export const FETCH_PERSON_SUCCESS = 'FETCH_PERSON_SUCCESS';
export const FETCH_PERSON_FAILURE = 'FETCH_PERSON_FAILURE';

export function updateFavoriteStatus(id) {
  return {
    types: [
      UPDATE_FAVORITE_STATUS_REQUEST,
      UPDATE_FAVORITE_STATUS_SUCCESS,
      UPDATE_FAVORITE_STATUS_FAILURE
    ],
    callAPI: ({ api }) => api.putPersonFavoriteStatus(id),
    payload: { id }
  };
}

export function fetchPerson(tmdb, imdb) {
  return {
    types: [
      FETCH_PERSON_REQUEST,
      FETCH_PERSON_SUCCESS,
      FETCH_PERSON_FAILURE
    ],
    callAPI: ({ api }) => tmdb ? api.getPersonByTmdb(tmdb) : api.getPerson(imdb),
    payload: { tmdb, imdb }
  };
}

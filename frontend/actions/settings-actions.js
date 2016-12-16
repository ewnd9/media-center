export const FETCH_TRAKT_PIN_REQUEST = 'settings/FETCH_TRAKT_PIN_REQUEST';
export const FETCH_TRAKT_PIN_SUCCESS = 'settings/FETCH_TRAKT_PIN_SUCCESS';
export const FETCH_TRAKT_PIN_FAILURE = 'settings/FETCH_TRAKT_PIN_FAILURE';

export const POST_TRAKT_PIN_REQUEST = 'settings/POST_TRAKT_PIN_REQUEST';
export const POST_TRAKT_PIN_SUCCESS = 'settings/POST_TRAKT_PIN_SUCCESS';
export const POST_TRAKT_PIN_FAILURE = 'settings/POST_TRAKT_PIN_FAILURE';

export const SHOW_PIN_INPUT = 'settings/SHOW_PIN_INPUT';

export function fetchTraktPin() {
  return dispatch => {
    return dispatch({
      types: [FETCH_TRAKT_PIN_REQUEST, FETCH_TRAKT_PIN_SUCCESS, FETCH_TRAKT_PIN_FAILURE],
      callAPI: ({ api }) => api.fetchTraktPin()
    });
  };
}

export function postTraktPin(pin) {
  return {
    types: [POST_TRAKT_PIN_REQUEST, POST_TRAKT_PIN_SUCCESS, POST_TRAKT_PIN_FAILURE],
    callAPI: ({ api }) => api.postTraktPin(pin),
    payload: { pin }
  };
}

export function togglePinInput() {
  return { type: SHOW_PIN_INPUT };
}

export const YOUTUBE_CHANGE_URL = 'YOUTUBE_CHANGE_URL';

export const YOUTUBE_STATE_INIT = '';
export const YOUTUBE_STATE_SUCCESS = 'has-success';
export const YOUTUBE_STATE_ERROR = 'has-error';

export const PLAY_YOUTUBE_REQUEST = 'PLAY_YOUTUBE_REQUEST'; // no reducers involved
export const PLAY_YOUTUBE_SUCCESS = 'PLAY_YOUTUBE_SUCCESS';
export const PLAY_YOUTUBE_FAILURE = 'PLAY_YOUTUBE_FAILURE';

export function changeUrl(url) {
  return dispatch => {
    let id;

    const regexps = [
      /youtu\.be\/([\w-]+)$/,
      /youtube.com\/.*v=([\w-]+).*$/
    ];

    for (const regex of regexps) {
      const match = regex.exec(url);

      if (match) {
        id = match[1];
        break;
      }
    }

    if (id) {
      dispatch({
        type: YOUTUBE_CHANGE_URL,
        status: YOUTUBE_STATE_SUCCESS,
        url
      });

      return dispatch(playYoutube(`https://www.youtube.com/watch?v=${id}`));
    } else {
      dispatch({
        type: YOUTUBE_CHANGE_URL,
        status: YOUTUBE_STATE_ERROR,
        url
      });

      return Promise.resolve();
    }
  };
}

export function playYoutube(url) {
  return {
    types: [
      PLAY_YOUTUBE_REQUEST,
      PLAY_YOUTUBE_SUCCESS,
      PLAY_YOUTUBE_FAILURE
    ],
    callAPI: ({ api }) => api.playYoutubeLink(url),
    payload: { url }
  };
}

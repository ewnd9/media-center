export const YOUTUBE_CHANGE_URL = 'YOUTUBE_CHANGE_URL';

export const STATE_INIT = '';
export const STATE_SUCCESS = 'has-success';
export const STATE_ERROR = 'has-error';

export function changeUrl(url) {
  return {
    type: YOUTUBE_CHANGE_URL,
    url
  };
}

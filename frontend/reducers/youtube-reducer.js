import {
  YOUTUBE_CHANGE_URL,
  STATE_INIT,
  STATE_SUCCESS,
  STATE_ERROR
} from '../actions/youtube-actions';

import { playYoutubeLink } from '../api';

function youtube(state = {
  url: '',
  status: STATE_INIT
}, action) {
  switch (action.type) {
    case YOUTUBE_CHANGE_URL:
      return changeUrl(state, action);
    default:
      return state;
  }
}

export default youtube;

function changeUrl(state, action) {
  let id;
  const url = action.url;

  const regexps = [
    /youtu\.be\/([\w-]+)$/,
    /youtube.com\/.*v=([\w-]+).*$/
  ];

  for (let regex of regexps) {
    const match = regex.exec(url);

    if (match) {
      id = match[1];
      break;
    }
  }

  if (id) {
    action.sideEffect(() => {
      playYoutubeLink(`https://www.youtube.com/watch?v=${id}`);
    });

    return {
      ...state,
      status: STATE_SUCCESS,
      url
    };
  } else {
    return {
      status: STATE_ERROR,
      url
    };
  }
}

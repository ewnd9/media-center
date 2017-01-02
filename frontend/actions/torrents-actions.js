import { fetchFiles } from './files-actions';

export const POST_TORRENT_REQUEST = 'POST_TORRENT_REQUEST';
export const POST_TORRENT_SUCCESS = 'POST_TORRENT_SUCCESS';
export const POST_TORRENT_FAILURE = 'POST_TORRENT_FAILURE';

export const POST_TORRENT_SERVER_REQUEST = 'POST_TORRENT_SERVER_REQUEST';
export const POST_TORRENT_SERVER_SUCCESS = 'POST_TORRENT_SERVER_SUCCESS';
export const POST_TORRENT_SERVER_FAILURE = 'POST_TORRENT_SERVER_FAILURE';

export function postTorrentMagnet(magnet) {
  return {
    types: [POST_TORRENT_REQUEST, POST_TORRENT_SUCCESS, POST_TORRENT_FAILURE],
    callAPI: ({ api }) => api.postTorrentMagnet(magnet),
    payload: { magnet }
  };
}

export function postServer(path) {
  return dispatch => {
    const action = {
      types: [POST_TORRENT_SERVER_REQUEST, POST_TORRENT_SERVER_SUCCESS, POST_TORRENT_SERVER_FAILURE],
      callAPI: ({ api }) => api.postTorrentServer(path),
      payload: { path }
    };

    return dispatch(action)
      .then(() => dispatch(fetchFiles()));
  };
}

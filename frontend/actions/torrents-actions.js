export const POST_TORRENT_REQUEST = 'POST_TORRENT_REQUEST';
export const POST_TORRENT_SUCCESS = 'POST_TORRENT_SUCCESS';
export const POST_TORRENT_FAILURE = 'POST_TORRENT_FAILURE';

export function postTorrentMagnet(magnet) {
  return {
    types: [POST_TORRENT_REQUEST, POST_TORRENT_SUCCESS, POST_TORRENT_FAILURE],
    callAPI: ({ api }) => api.postTorrentMagnet(magnet),
    payload: { magnet }
  };
}

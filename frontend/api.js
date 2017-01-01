import superagent from 'superagent';
import notify from './notify';
import report from './agent';

const baseUrl = '';
export const getBaseUrl = () => baseUrl;

const fetch = (req, url, options = {}) => {
  if (options.query) {
    req = req.query(options.query);
  }

  if (options.headers) {
    req = req.set(options.headers);
  }

  return reqToPromise(req, options, url)
    .catch(err => {
      notify.error(err.message);
      report(err, { url: window.location.href });
    });
};

export const get = (_url, query = {}) => {
  const url = baseUrl + _url;
  const req = superagent.get(url);

  return fetch(req, url, { query });
};

export const deleteRequest = (_url, query = {}) => {
  const url = baseUrl + _url;
  const req = superagent.delete(url);

  return fetch(req, url, { query });
};

export const post = (_url, body = {}, query) => {
  const url = baseUrl + _url;
  const req = superagent.post(url).send(JSON.stringify(body));

  return fetch(req, url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    query
  });
};

export const put = (_url, body = {}, query) => {
  const url = baseUrl + _url;
  const req = superagent.put(url).send(JSON.stringify(body));

  return fetch(req, url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    query
  });
};

export const playFile = (filename, media, position, noScrobble) => {
  return post('/api/v1/playback/start', {
    filename,
    media,
    position,
    noScrobble
  });
};

export const saveInfo = (filename, media) => {
  return post('/api/v1/playback/info', {
    filename,
    media
  });
};

export const addToHistory = (filename, media) => {
  return post('/api/v1/files/scrobble', {
    filename,
    media
  });
};

export const deleteFile = filename => {
  return deleteRequest(`/api/v1/files/${encodeURIComponent(filename)}`);
};

export const setHidden = (file, filename) => {
  return post('/api/v1/files/hidden', {
    filename,
    file
  });
};

export const updatePosition = (filename, media, position, duration) => {
  return post('/api/v1/files/position', {
    filename,
    media,
    position,
    duration
  });
};

export const findFiles = () => {
  return get('/api/v1/files');
};

export const getScreenshots = () => {
  return get('/api/v1/screenshots');
};

export const getMediaSuggestion = (type, title) => {
  return get('/api/v1/suggestions', {
    title,
    type
  });
};

export const getReport = () => {
  return get('/api/v1/trakt/report');
};

export const playYoutubeLink = query => {
  return post('/api/v1/youtube', { query });
};

export const getPosterPlaceholderUrl = () => {
  // @TODO should be passed with config (not implemented yet) from backend
  return `${baseUrl}/api/v1/posters/placeholder.jpg`;
};

export const getTmdbPosterUrl = url => {
  return url ? `http://image.tmdb.org/t/p/w500/${url}` : getPosterPlaceholderUrl();
};

export const getMovies = type => {
  const postfix = type === 'upcoming' ? '' : type;
  return get(`/api/v1/trakt/movies/${postfix}`);
};

export const getMovie = imdb => {
  return get(`/api/v1/trakt/movies/${imdb}`);
};

export const getMovieByTmdb = tmdb => {
  return get(`/api/v1/trakt/movies/tmdb/${tmdb}`);
};

export const getShow = imdb => {
  return get(`/api/v1/trakt/shows/${imdb}`);
};

export const getShowByTmdb = tmdb => {
  return get(`/api/v1/trakt/shows/tmdb/${tmdb}`);
};

export const getPerson = imdb => {
  return get(`/api/v1/trakt/persons/${imdb}`);
};

export const getPersonByTmdb = tmdb => {
  return get(`/api/v1/trakt/persons/tmdb/${tmdb}`);
};

export const getDvdReleasesDates = query => {
  return get('/api/v1/dvdreleasesdates/suggestions', {
    query
  });
};

export const updateMovieByReleaseDate = (imdb, releaseDate) => {
  return post('/api/v1/trakt/movies/release-date', {}, {
    imdb,
    releaseDate
  });
};

export const putPersonFavoriteStatus = id => {
  return put(`/api/v1/trakt/persons/${id}`);
};

export const postTraktPin = pin => {
  return post('/api/v1/trakt/pin', { pin });
};

export const fetchTraktPin = () => {
  return get('/api/v1/trakt/pin');
};

export const postTorrentMagnet = magnet => {
  return post('/api/v1/torrents', { magnet });
};

function reqToPromise(req, options = {}, url = '') {
  return new Promise((resolve, reject) => {
    req.end((err, { status, body }) => {
      if (err) {
        reject(new Error(`${options.method || 'GET'} ${url} returned ${status}<br />${body.error.join('<br />')}`)); // possible xss :-(
      } else {
        resolve(body);
      }
    });
  });
}

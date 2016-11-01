import superagent from 'superagent';
import notify from './notify';
import report from './agent';

let baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export const setBaseUrl = url => { // for react-native
  baseUrl = url;
};
export const getBaseUrl = () => baseUrl;

const fetch = (url, options = {}) => {
  let req = (
    options.method === 'post' ?
      superagent.post(url).send(options.body) :
      (options.method === 'delete' ? superagent.delete(url) : superagent.get(url))
  );

  if (options.query) {
    req = req.query(options.query);
  }

  if (options.headers) {
    req = req.set(options.headers);
  }

  return reqToPromise(req, options, url);
  // return req
  //   .then(({ body }) => {
  //     return body;
  //   })
  //   .catch((err, a) => {
  //     throw err; // @TODO figure out where is body in catch function
  //                         https://github.com/visionmedia/superagent/pull/925
  //   })
};

export const get = (url, query = {}) => {
  return fetch(baseUrl + url, { query })
    .catch(err => {
      notify.error(err.message);
      report(err, { url: window.location.href });
    });
};

export const deleteRequest = (url, query = {}) => {
  return fetch(baseUrl + url, { method: 'delete', query })
    .catch(err => {
      notify.error(err.message);
      report(err, { url: window.location.href });
    });
};

export const post = (url, body = {}, query) => {
  return fetch(baseUrl + url, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    query
  })
  .catch(err => {
    notify.error(err.message);
    report(err, { url: window.location.href });
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
  return get('/api/v1/suggestions?title=' + encodeURIComponent(title) + '&type=' + type);
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

export const getMovies = () => {
  return get('/api/v1/trakt/movies');
};

export const getMovie = imdb => {
  return get(`/api/v1/trakt/movies/${imdb}`);
};

export const getShow = imdb => {
  return get(`/api/v1/trakt/shows/${imdb}`);
};

export const getDvdReleasesDates = query => {
  return get('/api/v1/dvdreleasesdates/suggestions?query=' + encodeURIComponent(query));
};

export const updateMovieByReleaseDate = (imdb, releaseDate) => {
  return post('/api/v1/trakt/movies/release-date', {}, {
    imdb,
    releaseDate
  });
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

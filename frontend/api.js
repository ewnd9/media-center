import isomorphicFetch from 'isomorphic-fetch';
import notify from './notify';

export const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

const fetch = (url, options = {}) => (
  isomorphicFetch(url, options)
    .then(response => {
      if (response.status !== 200) {
        return response.json()
          .then(body => {
            throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}<br />${body.error.join('<br />')}`); // xss :-(
          });
      } else {
        return response.json();
      }
    })
);

export const get = url => {
  return fetch(baseUrl + url)
    .catch(err => notify.error(err.message));
};

export const post = (url, body) => {
  return fetch(baseUrl + url, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .catch(err => notify.error(err.message));
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

export const setHidden = (file, filename) => {
  return post('/api/v1/files/hidden', {
    filename,
    file
  });
};

export const findFiles = () => {
  return get('/api/v1/files');
};

export const getScreenshots = () => {
  return get('/api/v1/screenshots');
};

export const getMediaSuggestion = (title, type) => {
  return get('/api/v1/suggestions?title=' + encodeURIComponent(title) + '&type=' + type);
};

export const getReport = () => {
  return get('/api/v1/report');
};

export const playYoutubeLink = query => {
  return post('/api/v1/youtube', { query });
};

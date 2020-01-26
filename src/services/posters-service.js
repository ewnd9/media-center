import fsCache from '../utils/fs-cache';
import pify from 'pify';

import _mkdirp from 'mkdirp';
const mkdirp = pify(_mkdirp);

export default PostersService;

function PostersService(config) {
  if (!(this instanceof PostersService)) {
    return new PostersService(config);
  }

  const { tmdbApi, dbPath } = config;

  this.tmdbApi = tmdbApi;
  this.filePath = dbPath + '/posters';
  mkdirp(this.filePath);
}

PostersService.prototype.getPosterStreamFromTrakt = function(type, imdbId) {
  if (type === 'show') {
    return this.tmdbApi.getShowPosterByImdb(imdbId);
  } else {
    return this.tmdbApi.getMoviePosterByImdb(imdbId);
  }
};

PostersService.prototype.getPosterStream = function(type, imdbId) {
  const filePath = `${this.filePath}/${type}-${imdbId}.jpg`;
  return fsCache(filePath, () => this.getPosterStreamFromTrakt(type, imdbId));
};

PostersService.prototype.getPlaceholderPosterStream = function() {
  const filePath = `${this.filePath}/placeholder.jpg`;
  return fsCache(filePath, () => Promise.resolve('https://via.placeholder.com/200x300'));
};

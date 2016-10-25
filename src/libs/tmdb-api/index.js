import request from 'superagent';
export default TmdbApi;

const ROOT_URL = 'http://api.themoviedb.org';

function TmdbApi(key) {
  this.key = key;
}

TmdbApi.prototype.getRequest = function(url, query = {}) {
  return request
    .get(`${ROOT_URL}${url}`)
    .query({
      api_key: this.key,
      ...query
    })
    .then(res => res.body);
};

TmdbApi.prototype.searchByImdb = function(imdb) {
  return this.getRequest(`/3/find/${imdb}`, { external_source: 'imdb_id' });
};

TmdbApi.prototype.getMovieIdByImdb = function(imdb) {
  return this.searchByImdb(imdb)
    .then(res => res.movie_results[0].id);
};

TmdbApi.prototype.getMovie = function(id) {
  return this.getRequest(`/3/movie/${id}`);
};

TmdbApi.prototype.getMovieByImdb = function(imdb) {
  return this.getMovieIdByImdb(imdb)
    .then(id => this.getMovie(id));
};

TmdbApi.prototype.getMoviePosterByImdb = function(imdb) {
  return this.getMovieByImdb(imdb)
    .then(movie => `http://image.tmdb.org/t/p/w500/${movie.poster_path}`);
};

TmdbApi.prototype.getShowIdByImdb = function(imdb) {
  return this.searchByImdb(imdb)
    .then(res => {
      return res.tv_results[0].id;
    });
};

TmdbApi.prototype.getShow = function(id) {
  return this.getRequest(`/3/tv/${id}`);
};

TmdbApi.prototype.getShowByImdb = function(imdb) {
  return this.getShowIdByImdb(imdb)
    .then(id => this.getShow(id));
};

TmdbApi.prototype.getShowPosterByImdb = function(imdb) {
  return this.getShowByImdb(imdb)
    .then(show => `http://image.tmdb.org/t/p/w500/${show.poster_path}`);
};

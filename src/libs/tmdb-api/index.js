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

TmdbApi.prototype.getMovie = function(id, query) {
  return this.getRequest(`/3/movie/${id}`, query);
};

TmdbApi.prototype.getMovieByImdb = function(imdb, query) {
  return this.getMovieIdByImdb(imdb)
    .then(id => this.getMovie(id, query));
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

TmdbApi.prototype.getShow = function(id, query) {
  return this.getRequest(`/3/tv/${id}`, query);
};

TmdbApi.prototype.getShowByImdb = function(imdb, query) {
  return this.getShowIdByImdb(imdb)
    .then(id => this.getShow(id), query);
};

TmdbApi.prototype.getShowPosterByImdb = function(imdb) {
  return this.getShowByImdb(imdb)
    .then(show => `http://image.tmdb.org/t/p/w500/${show.poster_path}`);
};

TmdbApi.prototype.getPersonIdByImdb = function(imdb) {
  return this.searchByImdb(imdb)
    .then(res => res.person_results[0].id);
};

TmdbApi.prototype.getPerson = function(id) {
  const options = { append_to_response: 'movie_credits,tv_credits' };
  return this.getRequest(`/3/person/${id}`, options);
};

TmdbApi.prototype.getPersonByImdb = function(imdb) {
  return this.getPersonIdByImdb(imdb)
    .then(id => this.getPerson(id));
};

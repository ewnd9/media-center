import request from 'superagent';
export default TmdbApi;

const ROOT_URL = 'http://api.themoviedb.org';

function TmdbApi(key) {
  this.key = key;
}

TmdbApi.prototype.getMovieIdByImdb = function(imdb) {
  return request
    .get(`${ROOT_URL}/3/find/${imdb}`)
    .query({
      api_key: this.key,
      external_source: 'imdb_id'
    })
    .then(res => {
      return res.body.movie_results[0].id;
    });
};

TmdbApi.prototype.getMovie = function(id) {
  return request
    .get(`${ROOT_URL}/3/movie/${id}`)
    .query({
      api_key: this.key
    })
    .then(res => {
      return res.body;
    });
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
  return request
    .get(`${ROOT_URL}/3/find/${imdb}`)
    .query({
      api_key: this.key,
      external_source: 'imdb_id'
    })
    .then(res => {
      return res.body.tv_results[0].id;
    });
};

TmdbApi.prototype.getShow = function(id) {
  return request
    .get(`${ROOT_URL}/3/tv/${id}`)
    .query({
      api_key: this.key
    })
    .then(res => {
      return res.body;
    });
};

TmdbApi.prototype.getShowByImdb = function(imdb) {
  return this.getShowIdByImdb(imdb)
    .then(id => this.getShow(id));
};

TmdbApi.prototype.getShowPosterByImdb = function(imdb) {
  return this.getShowByImdb(imdb)
    .then(show => `http://image.tmdb.org/t/p/w500/${show.poster_path}`);
};

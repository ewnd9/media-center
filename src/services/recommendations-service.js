import level from 'level';
import levelgraph from 'levelgraph';
import leveldown from 'leveldown';

import uniqBy from 'lodash/uniqBy';
import pify from 'pify';

export default RecommendationsService;

function RecommendationsService(config, db) {
  if (!(this instanceof RecommendationsService)) {
    return new RecommendationsService(config, db);
  }

  const { dbPath } = config;

  this.db = db;
  this.graphPath = dbPath + '/recommendations-graph';
  this.initDb();
}

RecommendationsService.prototype.initDb = function() {
  this.graphLevel = level(this.graphPath);
  this.graph = levelgraph(this.graphLevel);

  this.graphPut = pify(this.graph.put.bind(this.graph));
  this.graphSearch = pify(this.graph.search.bind(this.graph));
};

RecommendationsService.prototype.recreateDb = function() {
  return pify(this.graphLevel.close.bind(this.graphLevel))()
    .then(() => {
      return pify(leveldown.destroy.bind(leveldown))(this.graphPath);
    })
    .then(() => {
      this.initDb();
    });
};

RecommendationsService.prototype.findMoviesRecommendations = function() {
  const { services: { tmdbService } } = this;

  const x = this.graph.v('x');
  const y = this.graph.v('y');

  const movieVertex = this.graph.v('movie');

  return this
    .graphSearch([
      { subject: x, predicate: 'in', object: movieVertex },
      { subject: y, predicate: 'in', object: movieVertex }
    ], {
      filter: (solution, callback) => {
        if (solution.x !== solution.y) {
          callback(null, solution);
        } else {
          callback(null);
        }
      }
    })
    .then(solutions => {
      const promises = solutions.map(solution => {
        return tmdbService.findMovie(solution.movie);
      });

      return Promise.all(promises);
    })
    .then(movies => {
      return uniqBy(movies, '_id');
    });
};

RecommendationsService.prototype.addMoviesByPerson = function(person) {
  const { db: { MovieScrobble }, services: { traktService } } = this;

  return Promise
    .all([
      MovieScrobble.findAll(),
      traktService.findMoviesByReleaseDate()
    ])
    .then(([ seenMovies, releaseDateMovies ]) => {
      const unseen = person.tmdbData.movie_credits.cast
        .filter(movie => {
          return !seenMovies.find(seenMovie => seenMovie.tmdb === movie.id) &&
                 !releaseDateMovies.find(rdMovie => rdMovie.tmdb === movie.id);
        });

      const promises = unseen.map(movie => {
        return this.graphPut({
          subject: person._id,
          predicate: 'in',
          object: movie.id // external movie, id is tmdb
        });
      });

      return Promise.all(promises);
    });
}

RecommendationsService.prototype.rescanMovieRecommendations = function() {
  const { services: { personsService } } = this;

  return this
    .recreateDb()
    .then(() => {
      return personsService.findFavoritePersons();
    })
    .then(persons => {
      const promises = persons.map(person => this.addMoviesByPerson(person));
      return Promise.all(promises);
    });
};

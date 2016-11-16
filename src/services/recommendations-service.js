import level from 'level';
import levelgraph from 'levelgraph';

import uniqBy from 'lodash/uniqBy';
import pify from 'pify';

export default RecommendationsService;

function RecommendationsService(config, db) {
  if (!(this instanceof RecommendationsService)) {
    return new RecommendationsService(config, db);
  }

  const { dbPath } = config;

  this.graphPath = dbPath + '/recommendations-graph';
  this.graphLevel = level(this.graphPath);
  this.graph = levelgraph(this.graphLevel);

  this.graphPut = pify(this.graph.put.bind(this.graph));
  this.graphSearch = pify(this.graph.search.bind(this.graph));
}

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

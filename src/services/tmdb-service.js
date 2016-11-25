import promiseLimit from 'promise-limit';
import uniq from 'lodash/uniq';

import { imdbIndex as showImdbIndex } from '../models/show';
import { imdbIndex as movieImdbIndex } from '../models/movie';

export default TmdbService;

function TmdbService(config, db) {
  if (!(this instanceof TmdbService)) {
    return new TmdbService(config, db);
  }

  const { tmdbApi } = config;

  this.tmdbApi = LimitedTmdb(tmdbApi);
  this.db = db;
}

function LimitedTmdb(source) {
  const limit = promiseLimit(2);

  const methods = [
    'getShowPosterByImdb',
    'getMoviePosterByImdb',
    'getShow',
    'getShowByImdb',
    'getMovie',
    'getMovieByImdb',
    'getPerson',
    'getPersonByImdb'
  ];

  return methods.reduce((total, methodName) => {
    const method = source[methodName];
    total[methodName] = function() {
      return limit(() => {
        const args = Array.prototype.slice.apply(arguments).map(x => JSON.stringify(x)).join(', ');
        console.log('tmdb-api', methodName, args);

        return method.apply(source, arguments);
      });
    };
    return total;
  }, {});
}

TmdbService.prototype.getTmdbApi = function() {
  return this.tmdbApi;
};

TmdbService.prototype._updateShow = function(tmdb, imdb) {
  const { tmdbApi } = this;
  const query = { append_to_response: 'external_ids,credits' };
  const fn = tmdb ? tmdbApi.getShow(tmdb, query) : tmdbApi.getShowByImdb(imdb, query);

  return fn
    .then(show => {
      return this._formatTmdbShowData(show.id, imdb, show);
    });
};

TmdbService.prototype._updateMovie = function(tmdb, imdb) {
  const { tmdbApi } = this;
  const query = { append_to_response: 'credits' };
  const fn = tmdb ? tmdbApi.getMovie(tmdb, query) : tmdbApi.getMovieByImdb(imdb, query);

  return fn
    .then(movie => {
      return this._formatTmdbMovieData(movie.id, movie.imdb_id, movie);
    });
};

TmdbService.prototype._fetchFullShow = function(show) {
  const { tmdbApi, db: { Show } } = this;
  const { tmdb, imdb } = show;

  const seasonsQuery = uniq(show.tmdbData.seasons
    .map(season => `season/${season.season_number}`));

  const groups = groupToPartition(seasonsQuery, 18); // tmdb api limit

  return Promise
    .all(
      groups.map(group => {
        const options = {
          append_to_response: 'credits,' + group.join(',')
        };

        return tmdbApi.getShow(tmdb, options);
      })
    )
    .then(shows => {
      const show = shows.reduce((total, curr) => {
        if (!total) {
          return curr;
        } else {
          for (const key in curr) {
            if (key.indexOf('season/') === 0) {
              total[key] = curr[key];
            }
          }

          return total;
        }
      });

      return Show.update(this._formatTmdbShowData(tmdb, imdb, show));
    });
};

TmdbService.prototype._fetchShow = function(tmdb, imdb) {
  const { db: { Show } } = this;

  const fn = tmdb ? (
    Show
      .findOneOrInit(
        { tmdb },
        () => this._updateShow(tmdb, imdb).then(data => Show.put(data))
      )
  ) : (
    Show.db
      .query(showImdbIndex, { key: imdb, include_docs: true })
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows[0].doc;
        } else {
          return this._updateShow(tmdb, imdb).then(data => Show.put(data));
        }
      })
  );

  return fn
    .then(show => {
      const diff = (Date.now() - new Date(show.syncedAt).getTime()) / 1000 / 60 / 60 / 24 | 0;

      if (!show.tmdbData['season/1'] || (show.status !== 'Ended' && diff > 10)) {
        return this._fetchFullShow(show);
      }

      return show;
    })
    .then(show => this._mergePersons(show));
};

TmdbService.prototype._fetchMovie = function(tmdb, imdb) {
  const { db: { Movie } } = this;

  const fn = tmdb ? (
    Movie
      .findOneOrInit(
        { tmdb },
        () => this._updateMovie(tmdb, imdb).then(data => Movie.put(data))
      )
  ) : (
    Movie.db
      .query(movieImdbIndex, { key: imdb, include_docs: true })
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows[0].doc;
        } else {
          return this._updateMovie(tmdb, imdb).then(data => Movie.put(data));
        }
      })
  );

  return fn.then(movie => this._mergePersons(movie));
};

TmdbService.prototype._formatTmdbShowData = function(tmdb, imdb, show) {
  return {
    tmdb: show.id,
    imdb: imdb || (show.external_ids && show.external_ids.imdb_id),
    tmdbData: show,
    title: show.name,
    status: show.status,
    syncedAt: new Date().toISOString()
  };
};

TmdbService.prototype._formatTmdbMovieData = function(tmdb, imdb, movie) {
  return {
    imdb,
    tmdb: +tmdb,
    tmdbData: movie,
    title: movie.title,
    syncedAt: new Date().toISOString()
  };
};

TmdbService.prototype._mergeEpisodeScrobbles = function(show, docs) {
  show.episodes = [];

  Object
    .keys(show.tmdbData)
    .filter(key => key.indexOf('season/') === 0)
    .map(seasonName => {
      const season = show.tmdbData[seasonName];

      if (seasonName !== 'season/0') {
        show.episodes = show.episodes.concat(
          season.episodes
            .filter(ep => ep.season_number > 0 && ep.episode_number > 0)
            .map(ep => {
              ep.watched = !!docs.find(doc => doc.s === ep.season_number && doc.ep === ep.episode_number);
              return ep;
            })
        );
      }

      delete show.tmdbData[seasonName];
    });

  return show;
};

TmdbService.prototype._mergePersons = function(media) {
  if (!media.tmdbData) {
    return media;
  }

  const { db: { Person } } = this;
  const { credits } = media.tmdbData;

  const keys = credits.cast.map(_ => _.id)
    .concat(credits.crew.map(_ => _.id))
    .map(tmdb => Person.createId({ tmdb }));

  return Person.db.allDocs({ include_docs: true, keys })
    .then(persons => {
      const fn = person => {
        const dbPerson = persons.rows.find(p => {
          return p.doc && p.doc.tmdb === person.id;
        });

        if (dbPerson) {
          person.isFavorite = dbPerson.doc.isFavorite;
        }
      };

      credits.cast.forEach(fn);
      credits.crew.forEach(fn);

      return media;
    });
};

TmdbService.prototype._findShow = function(tmdb, imdb) {
  return Promise
    .all([
      this._fetchShow(tmdb, imdb),
      this.db.EpisodeScrobble.db.allDocs({
        startkey: `episode-scrobble:${imdb}`,
        endkey: `episode-scrobble:${imdb}\uffff`,
        include_docs: true
      })
    ])
    .then(([show, docs]) => {
      return this._mergeEpisodeScrobbles(show, docs.rows.map(row => row.doc));
    });
};

TmdbService.prototype.findShow = function(tmdb) {
  return this._findShow(tmdb, null);
};

TmdbService.prototype.findShowByImdb = function(imdb) {
  return this._findShow(null, imdb);
};

TmdbService.prototype.findMovie = function(tmdb) {
  return this._fetchMovie(tmdb, null);
};

TmdbService.prototype.findMovieByImdb = function(imdb) {
  return this._fetchMovie(null, imdb);
};

function groupToPartition(array, count) {
  return array.reduce((total, curr) => {
    if (total.length === 0) {
      total.push([curr]);
    } else {
      const last = total[total.length - 1];

      if (last.length === count) {
        total.push([curr]);
      } else {
        last.push(curr);
      }
    }

    return total;
  }, []);
}

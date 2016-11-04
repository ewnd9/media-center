import Cache from '../utils/cache';

import pify from 'pify';

import _mkdirp from 'mkdirp';
const mkdirp = pify(_mkdirp);

import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import fsCache from '../utils/fs-cache';
import getPosterUrl from '../utils/poster-url';

import * as dvdReleasesApi from '../libs/dvdreleasedates-api/';

import { lastDateIndex } from '../models/episode-scrobble';
import { imdbIndex as showImdbIndex } from '../models/show';
import { imdbIndex as movieImdbIndex, releaseDateIndex } from '../models/movie';
import { imdbIndex as personImdbIndex } from '../models/person';

import promiseLimit from 'promise-limit';
import level from 'level';
import levelgraph from 'levelgraph';

export const REPORT_CACHE = 'REPORT_CACHE';

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

function TraktService(trakt, filePath, tmdbApi, db) {
  this.cache = new Cache();
  this.trakt = trakt;
  this.tmdbApi = LimitedTmdb(tmdbApi);
  this.filePath = filePath + '/posters';

  this.graphPath = filePath + '/recommendations-graph';
  this.graphLevel = level(this.graphPath);
  this.graph = levelgraph(this.graphLevel);
  this.graphPut = pify(this.graph.put.bind(this.graph));
  this.graphSearch = pify(this.graph.search.bind(this.graph));

  this.db = db;
  mkdirp(this.filePath);

  this.search = this.trakt.search.bind(this.trakt);
}

TraktService.prototype.addToHistory = function() {
  return this.trakt.addToHistory.apply(this.trakt, arguments)
    .then(result => {
      return Promise
        .all([
          this.syncShowsHistory(),
          this.syncMoviesHistory(),
        ])
        .then(() => result);
    });
};

TraktService.prototype.prefetch = function() {
  return this.getReport();
};

TraktService.prototype.getPosterStream = function(type, imdbId) {
  const filePath = `${this.filePath}/${type}-${imdbId}.jpg`;
  return fsCache(filePath, () => this.getPosterStreamFromTrakt(type, imdbId));
};

TraktService.prototype.getPlaceholderPosterStream = function() {
  const filePath = `${this.filePath}/placeholder.jpg`;
  return fsCache(filePath, () => Promise.resolve('https://placeholdit.imgix.net/~text?txtsize=19&txt=200%C3%97300&w=200&h=300'));
};

TraktService.prototype.getPosterStreamFromTrakt = function(type, imdbId) {
  if (type === 'show') {
    return this.tmdbApi.getShowPosterByImdb(imdbId);
  } else {
    return this.tmdbApi.getMoviePosterByImdb(imdbId);
  }
};

TraktService.prototype.syncShowsHistory = function() {
  const { EpisodeScrobble } = this.db;
  const items = [];

  return this.trakt
    .request('/sync/watched/shows')
    .then(shows => {

      for (const show of shows) {
        for (const season of show.seasons) {
          for (const episode of season.episodes) {
            const data = {
              imdb: show.show.ids.imdb,
              tmdb: show.show.ids.tmdb,
              s: season.number,
              ep: episode.number,
              lastDate: new Date(episode.last_watched_at).toISOString(),
              plays: episode.plays
            };

            data._id = EpisodeScrobble.createId(data);
            items.push(data);
          }
        }
      }

      return EpisodeScrobble.db.allDocs({
        include_docs: false,
        keys: items.map(item => item._id)
      });

    })
    .then(existed => {
      const notFound = existed.rows
        .filter(row => row.error === 'not_found')
        .map(row => items.find(item => item._id === row.key));

      return EpisodeScrobble.db.bulkDocs(notFound);
    });
};

TraktService.prototype.syncMoviesHistory = function() {
  const { Movie, MovieScrobble } = this.db;

  let items;
  let imdb;

  return this.trakt
    .request('/sync/watched/movies')
    .then(movies => {
      items = movies.map(movie => {
        const data = {
          imdb: movie.movie.ids.imdb,
          tmdb: movie.movie.ids.tmdb,
          lastDate: new Date(movie.last_watched_at).toISOString(),
          plays: movie.plays
        };

        data._id = MovieScrobble.createId(data);
        return data;
      });

      imdb = items.map(item => item.imdb);

      return MovieScrobble.db.allDocs({
        include_docs: false,
        keys: items.map(item => item._id)
      });
    })
    .then(existed => {
      const notFound = existed.rows
        .filter(row => row.error === 'not_found')
        .map(row => items.find(item => item._id === row.key));

      return MovieScrobble.db.bulkDocs(notFound);
    })
    .then(() => {
      return Movie.db.query(movieImdbIndex, { keys: imdb, include_docs: true });
    })
    .then(res => {
      const data = res.rows.filter(row => !!!row.doc.isWatched).map(row => {
        row.doc.isWatched = true;
        return row.doc;
      });

      if (data.length > 0) {
        return Movie.db.bulkDocs(data);
      }
    });
};

TraktService.prototype.getLastShowScrobbles = function() {
  const { EpisodeScrobble } = this.db;
  return EpisodeScrobble.findByIndex(lastDateIndex, { descending: true, limit: 20 });
};

TraktService.prototype._updateShow = function(tmdb, imdb) {
  const { tmdbApi } = this;
  const query = { append_to_response: 'external_ids,credits' };
  const fn = tmdb ? tmdbApi.getShow(tmdb, query) : tmdbApi.getShowByImdb(imdb, query);

  return fn
    .then(show => {
      return this._formatTmdbShowData(show.id, imdb, show);
    });
};

TraktService.prototype._updateMovie = function(tmdb, imdb) {
  const { tmdbApi } = this;
  const query = { append_to_response: 'credits' };
  const fn = tmdb ? tmdbApi.getMovie(tmdb, query) : tmdbApi.getMovieByImdb(imdb, query);

  return fn
    .then(movie => {
      return this._formatTmdbMovieData(movie.id, movie.imdb_id, movie);
    });
};

TraktService.prototype._fetchFullShow = function(show) {
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

TraktService.prototype._fetchShow = function(tmdb, imdb) {
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

TraktService.prototype._fetchMovie = function(tmdb, imdb) {
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

TraktService.prototype._formatTmdbShowData = function(tmdb, imdb, show) {
  return {
    tmdb: show.id,
    imdb: imdb || (show.external_ids && show.external_ids.imdb_id),
    tmdbData: show,
    title: show.name,
    status: show.status,
    syncedAt: new Date().toISOString()
  };
};

TraktService.prototype._formatTmdbMovieData = function(tmdb, imdb, movie) {
  return {
    imdb,
    tmdb: +tmdb,
    tmdbData: movie,
    title: movie.title,
    syncedAt: new Date().toISOString()
  };
};

TraktService.prototype._mergeEpisodeScrobbles = function(show, docs) {
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

TraktService.prototype._mergePersons = function(media) {
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

TraktService.prototype.getShowReport = function() {
  const { db: { EpisodeScrobble } } = this;
  const that = this;

  return EpisodeScrobble
    .findAll({})
    .then(docs => {
      const groups = groupBy(docs, doc => doc.tmdb);

      return Promise
        .all(
          Object
            .keys(groups)
            .map(tmdb => fetchShow(tmdb, groups[tmdb]))
        );
    });

  function fetchShow(tmdb, docs) {
    const imdb = docs[0].imdb;

    return that._fetchShow(tmdb, imdb)
      .then(show => that._mergeEpisodeScrobbles(show, docs));
  }
};

TraktService.prototype.getShowReportWithPosterUrls = function(host) {
  return this
    .getShowReport()
    .then(reports => {
      reports
        .forEach(show => {
          show.posterUrl = getPosterUrl('show', show.imdb, undefined, host);
        });

      return reports;
    });
};

TraktService.prototype._findShow = function(tmdb, imdb, host) {
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
      show.posterUrl = getPosterUrl('show', show.imdb, undefined, host);
      return this._mergeEpisodeScrobbles(show, docs.rows.map(row => row.doc));
    });
};

TraktService.prototype.findShow = function(tmdb, host) {
  return this._findShow(tmdb, null, host);
};

TraktService.prototype.findShowByImdb = function(imdb, host) {
  return this._findShow(null, imdb, host);
};

TraktService.prototype.findMovie = function(tmdb, host) {
  return this._fetchMovie(tmdb, null)
    .then(movie => movieWithPosterUrl(movie, host));
};

TraktService.prototype.findMovieByImdb = function(imdb, host) {
  return this._fetchMovie(null, imdb)
    .then(movie => movieWithPosterUrl(movie, host));
};

TraktService.prototype.searchDvdReleases = function(query) {
  return dvdReleasesApi.search(query);
};

TraktService.prototype.updateMovieByReleaseDate = function(imdb, releaseDate, host) {
  const { db: { Movie } } = this;

  return this._fetchMovie(null, imdb)
    .then(movie => {
      if (movie.releaseDate !== releaseDate) {
        movie.releaseDate = releaseDate;

        return Movie.update(movie);
      }

      return movie;
    })
    .then(movie => movieWithPosterUrl(movie, host));
};

TraktService.prototype.findMoviesByReleaseDate = function(host) {
  const { db: { Movie } } = this;
  return Movie.db
    .query(releaseDateIndex, { include_docs: true, descending: true })
    .then(res => {
      return res.rows.map(row => movieWithPosterUrl(row.doc, host));
    });
};

TraktService.prototype._formatTmdbPersonData = function(person) {
  const data = {
    tmdb: person.id,
    imdb: person.imdb_id,
    name: person.name,
    isFavorite: true,
    tmdbData: person,
    syncedAt: new Date().toISOString()
  };

  return data;
};

TraktService.prototype._updatePerson = function(tmdb, imdb) {
  const { tmdbApi } = this;
  const fn = tmdb ? tmdbApi.getPerson(tmdb) : tmdbApi.getPersonByImdb(imdb);

  return fn.then(person => this._formatTmdbPersonData(person));
};

TraktService.prototype._fetchPerson = function(tmdb, imdb) {
  const { db: { Person } } = this;

  const fn = tmdb ? (
    Person
      .findOneOrInit(
        { tmdb },
        () => this._updatePerson(tmdb, imdb).then(data => Person.put(data))
      )
  ) : (
    Person.db
      .query(personImdbIndex, { key: imdb, include_docs: true })
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows[0].doc;
        } else {
          return this._updatePerson(tmdb, imdb).then(data => Person.put(data));
        }
      })
  );

  return fn;
};

TraktService.prototype.findPerson = function(tmdb) {
  return this._fetchPerson(tmdb, null);
};

TraktService.prototype.findPersonByImdb = function(imdb) {
  return this._fetchPerson(null, imdb);
};

TraktService.prototype.addPerson = function(tmdb) {
  const { db: { MovieScrobble } } = this;

  let person;

  return this._fetchPerson(tmdb, null)
    .then(_person => {
      person = _person;
      return MovieScrobble.findAll();
    })
    .then(movies => {
      const unseen = person.tmdbData.movie_credits.cast
        .filter(movie => {
          return !movies.find(seenMovie => seenMovie.tmdb === movie.id);
        });

      const promises = unseen.map(movie => {
        return this.graphPut({
          subject: person._id,
          predicate: 'in',
          object: movie.id // external movie, id is tmdb
        });
      });

      return Promise.all(promises);
    })
    .then(() => person);
};

TraktService.prototype.findMoviesRecommendations = function(host) {
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
        return this.findMovie(solution.movie, host);
      });

      return Promise.all(promises);
    })
    .then(movies => {
      return uniqBy(movies, '_id');
    });
};

function movieWithPosterUrl(movie, host) {
  movie.posterUrl = getPosterUrl('movie', movie.imdb, undefined, host);
  return movie;
}

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

export default TraktService;

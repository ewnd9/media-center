import Cache from '../utils/cache';

import pify from 'pify';

import _mkdirp from 'mkdirp';
const mkdirp = pify(_mkdirp);

import groupBy from 'lodash/groupBy';

import fsCache from '../utils/fs-cache';
import * as dvdReleasesApi from '../libs/dvdreleasedates-api/';

import { lastDateIndex } from '../models/episode-scrobble';
import { imdbIndex as movieImdbIndex, releaseDateIndex } from '../models/movie';

export const REPORT_CACHE = 'REPORT_CACHE';
export default TraktService;

function TraktService(config, db) {
  if (!(this instanceof TraktService)) {
    return new TraktService(config, db);
  }

  const { trakt, dbPath } = config;

  this.cache = new Cache();
  this.trakt = trakt;
  this.filePath = dbPath + '/posters';

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
  return this.getShowReport();
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

TraktService.prototype.getShowReport = function() {
  const { db: { EpisodeScrobble }, services: { tmdbService } } = this;

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

    return tmdbService._fetchShow(tmdb, imdb)
      .then(show => tmdbService._mergeEpisodeScrobbles(show, docs));
  }
};

TraktService.prototype.searchDvdReleases = function(query) {
  return dvdReleasesApi.search(query);
};

TraktService.prototype.updateMovieByReleaseDate = function(imdb, releaseDate) {
  const { db: { Movie }, services: { tmdbService } } = this;

  return tmdbService._fetchMovie(null, imdb)
    .then(movie => {
      if (movie.releaseDate !== releaseDate) {
        movie.releaseDate = releaseDate;
        return Movie.update(movie);
      }

      return movie;
    });
};

TraktService.prototype.findMoviesByReleaseDate = function() {
  const { db: { Movie } } = this;
  return Movie.db
    .query(releaseDateIndex, { include_docs: true, descending: true })
    .then(res => res.rows.map(row => row.doc));
};

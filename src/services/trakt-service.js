import Cache from '../utils/cache';

import pify from 'pify';

import _mkdirp from 'mkdirp';
const mkdirp = pify(_mkdirp);

import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

import fsCache from '../utils/fs-cache';
import getPosterUrl from '../utils/poster-url';

import { lastDateIndex } from '../models/episode-scrobble';
import { imdbIndex } from '../models/show';
import promiseLimit from 'promise-limit';

export const REPORT_CACHE = 'REPORT_CACHE';

function LimitedTmdb(source) {
  const limit = promiseLimit(2);

  const methods = [
    'getShowPosterByImdb',
    'getMoviePosterByImdb',
    'getShow',
    'getShowByImdb'
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
  this.db = db;
  mkdirp(this.filePath);

  this.search = this.trakt.search.bind(this.trakt);
  this.addToHistory = this.trakt.addToHistory.bind(this.trakt);
}

TraktService.prototype.prefetch = function() {
  return this.getReport();
};

TraktService.prototype.getPosterStream = function(type, imdbId) {
  const filePath = `${this.filePath}/${type}-${imdbId}.jpg`;
  return fsCache(filePath, () => this.getPosterStreamFromTrakt(type, imdbId));
};

TraktService.prototype.getPlaceholderPosterStream = function() {
  const filePath = `${this.filePath}/placeholder.jpg`;
  return fsCache(filePath, () => Promise.resolve('https://unsplash.it/g/200/300'));
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

TraktService.prototype.getLastShowScrobbles = function() {
  const { EpisodeScrobble } = this.db;
  return EpisodeScrobble.findByIndex(lastDateIndex, { descending: true, limit: 20 });
};

TraktService.prototype._updateShow = function(tmdb, imdb, options) {
  const { tmdbApi } = this;
  const fn = tmdb ? tmdbApi.getShow(tmdb, options) : tmdbApi.getShowByImdb(imdb, options);

  return fn
    .then(show => {
      return this._formatTmdbData(show.id, imdb, show);
    });
};

TraktService.prototype._fetchFullShow = function(show) {
  const { tmdbApi, db: { Show } } = this;
  const { tmdb, imdb } = show;

  const seasonsQuery = uniq(show.tmdbData.seasons
    .map(season => `season/${season.season_number}`));

  const groups = groupToPartition(seasonsQuery, 20); // tmdb api limit

  return Promise
    .all(
      groups.map(group => {
        const options = {
          append_to_response: group.join(',')
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

      return Show.update(this._formatTmdbData(tmdb, imdb, show));
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
      .query(imdbIndex, { key: imdb, include_docs: true })
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
    });
};

TraktService.prototype._formatTmdbData = function(tmdb, imdb, show) {
  return {
    imdb,
    tmdb: +tmdb,
    tmdbData: show,
    title: show.name,
    status: show.status,
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

TraktService.prototype.findShowByImdb = function(imdb, host) {
  return Promise
    .all([
      this._fetchShow(null, imdb),
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

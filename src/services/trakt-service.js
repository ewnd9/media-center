import Cache from '../utils/cache';

import pify from 'pify';

import _mkdirp from 'mkdirp';
const mkdirp = pify(_mkdirp);

import fsCache from '../utils/fs-cache';
import getPosterUrl from '../utils/poster-url';

export const REPORT_CACHE = 'REPORT_CACHE';

function TraktService(trakt, filePath) {
  this.cache = new Cache();
  this.trakt = trakt;
  this.filePath = filePath + '/posters';
  mkdirp(this.filePath);

  this.search = this.trakt.search.bind(this.trakt);
  this.addToHistory = this.trakt.addToHistory.bind(this.trakt);
}

TraktService.prototype.prefetch = function() {
  return this.getReport();
};

TraktService.prototype._getReport = function() {
  return this.trakt
    .getReport()
    .then(report => {
      report.forEach(items => {
        items.forEach(item => {
          let showIds;

          if (item.report.aired.length > 0) {
            showIds = item.report.aired[0].show.ids;
          }

          if (item.report.future.length > 0) {
            showIds = item.report.future[0].episodes[0].show.ids;
          }

          item.showIds = showIds;
        });
      });

      return report;
    });
};

TraktService.prototype.getReport = function() {
  return this.cache.getOrInit(REPORT_CACHE, this._getReport.bind(this));
};

TraktService.prototype.getReportWithPosterUrls = function(host) {
  return this
    .getReport()
    .then(reportsByType => {
      reportsByType.forEach(reports => {
        reports.forEach(report => {
          report.posterUrl = getPosterUrl('show', report.showIds.imdb, undefined, host);
        });
      });

      return reportsByType;
    });
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
    return this.trakt
      .getShow(imdbId, 'images')
      .then(show => {
        return show.images.poster.thumb;
      });
  } else {
    return this.trakt
      .getMovie(imdbId, 'images')
      .then(movie => {
        return movie.images.poster.thumb;
      });
  }
};

export default function(trakt, filePath) {
  return new TraktService(trakt, filePath);
}

import Cache from '../utils/cache';

export const REPORT_CACHE = 'REPORT_CACHE';

function TraktService(trakt) {
  this.cache = new Cache();
  this.trakt = trakt;

  this._getReport = this.trakt.getReport.bind(this.trakt);
  this.search = this.trakt.search.bind(this.trakt);
}

TraktService.prototype.getReport = function() {
  return this.cache.getOrInit(REPORT_CACHE, this._getReport);
};

export default function(trakt) {
  return new TraktService(trakt);
}

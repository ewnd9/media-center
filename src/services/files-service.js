import findFiles from '../find-files';
import Cache from '../utils/cache';
import proxy from '../utils/proxy';
import dlnaQuery from '../libs/dlna-query';

export const FIND_FILES = 'FIND_FILES';

function FilesService(models, rootDir) {
  this.cache = new Cache();

  this.models = models;
  this.rootDir = rootDir;

  this._addFile = proxy(models.File, models.File.add);
  this._updateFile = proxy(models.File, models.File.update);

  this.renewFindAllFiles = this.renewFindAllFiles.bind(this);
  this.findFiles = this.findFiles.bind(this);
}

FilesService.prototype.findFiles = function() {
  return Promise
    .all([
      findFiles(this.models, this.rootDir),
      this.findDlnaFiles()
    ])
    .then(([ files, dlna ]) => {

      files.forEach(file => {
        file.media.forEach(media => {
          const parts = media.fileName.split('.');
          const baseName = parts.slice(0, parts.length - 1).join('.');

          const result = dlna.find(item => item.file === baseName);

          if (result) {
            media.streamUrl = result.url;
          }
        });
      });

      return files;

    });
};

FilesService.prototype.findDlnaFiles = function() {
  return process.env.NODE_ENV === 'production' ?
    dlnaQuery().then(null, err => {
      console.error(err);
      Promise.resolve([]);
    }) :
    Promise.resolve([]);
};

FilesService.prototype.prefetch = function() {
  return this.findAllFiles();
};

FilesService.prototype.findAllFiles = function() {
  return this.cache.getOrInit(FIND_FILES, this.findFiles);
};

FilesService.prototype.renewFindAllFiles = function(result) {
  this.cache.renew(FIND_FILES, this.findFiles);
  return result;
};

FilesService.prototype.addFile = function() {
  return this._addFile(arguments).then(this.renewFindAllFiles);
};

FilesService.prototype.updateFile = function() {
  return this._updateFile(arguments).then(this.renewFindAllFiles);
};

FilesService.prototype.updatePosition = function(uri, media, position, duration) {
  return this
    .updateFile(uri, { position, duration })
    .then(res => {
      const pos = position / duration * 100;

      if (!res.scrobble && pos !== Infinity && pos > 80) {
        return this.addToHistory(uri, media);
      }
    });
};

FilesService.prototype.addToHistory = function(uri, media) {
  return this.services.traktService
    .addToHistory(media)
    .then(() => this.updateFile(uri, {
      scrobble: true,
      scrobbleAt: new Date().toISOString()
    }));
};

export default function(db, mediaPath) {
  return new FilesService(db, mediaPath);
}

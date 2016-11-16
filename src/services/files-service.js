import findFiles from '../find-files';
import Cache from '../utils/cache';
import proxy from '../utils/proxy';
import dlnaQuery from '../libs/dlna-query';
import replaceHostname from '../libs/replace-link-hostname';
import fs from 'fs';
import pify from 'pify';
import path from 'path';
import mkdirp from 'mkdirp';

const moveFile = pify(fs.rename);
const mkdir = pify(mkdirp);

export const FIND_FILES = 'FIND_FILES';
export default FilesService;

function FilesService(config, models) {
  if (!(this instanceof FilesService)) {
    return new FilesService(config, models);
  }

  const { mediaPath: rootDir, mediaTrashPath: trashDir } = config;

  this.cache = new Cache();

  this.models = models;
  this.rootDir = rootDir;
  this.trashDir = trashDir;

  this._addFile = proxy(models.File, models.File.add);
  this._updateFile = proxy(models.File, models.File.update);
  this._putFile = proxy(models.File, models.File.put);

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
      return Promise.resolve([]);
    }) :
    Promise.resolve([]);
};

FilesService.prototype.prefetch = function() {
  return this.findAllFiles();
};

FilesService.prototype.findAllFiles = function() {
  return this.cache.getOrInit(FIND_FILES, this.findFiles);
};

FilesService.prototype.findAllFilesWithStreamUrls = function(host) {
  return this
    .findAllFiles()
    .then(files => {

      // @TODO think maybe external ip should be set via environment variable?
      files.forEach(file => {
        file.posterUrl = replaceHostname(file.posterUrl, host, true);

        file.media.forEach(media => {
          if (media.streamUrl) {
            media.streamUrl = replaceHostname(media.streamUrl, host);
          }
        });
      });

      return files;
    });
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
    .updateFile(uri, { ...media, position, duration })
    .then(res => {
      const pos = position / duration * 100;

      if (!res.scrobble && pos !== Infinity && pos > 80) {
        return this.addToHistory(uri, res);
      } else {
        return res;
      }
    });
};

FilesService.prototype.addToHistory = function(uri, media) {
  return this.services.traktService
    .addToHistory(media)
    .then(() => this.updateFile(uri, {
      ...media,
      scrobble: true,
      scrobbleAt: new Date().toISOString()
    }));
};

FilesService.prototype.deleteFile = function(filename) {
  const srcFile = safePathJoin(this.rootDir, filename);
  const destFile = safePathJoin(this.trashDir, filename);

  const destDir = path.dirname(destFile);

  return mkdir(destDir)
    .then(() => moveFile(srcFile, destFile));
};

function safePathJoin(base, file) {
  // https://security.stackexchange.com/questions/123720/how-to-prevent-directory-traversal-when-joining-paths-in-node-js
  const safe = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');
  return path.join(base, safe);
}

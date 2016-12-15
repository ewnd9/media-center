import { findFiles, mergeFiles } from '../find-files';
import Cache from '../utils/cache';
import dlnaQuery from '../libs/dlna-query';
import replaceHostname from '../libs/replace-link-hostname';
import fs from 'fs';
import pify from 'pify';
import path from 'path';
import mkdirp from 'mkdirp';
import report from '../agent';

const moveFile = pify(fs.rename);
const mkdir = pify(mkdirp);

export const FIND_FILES = 'FIND_FILES';
export const FIND_FS_FILES = 'FIND_FS_FILES';
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

  this.renewFindFiles = this.renewFindFiles.bind(this);
  this.findFiles = this.findFiles.bind(this);

  this._findFiles = this._findFiles.bind(this);
  this._findFSFiles = this._findFSFiles.bind(this);
}

FilesService.prototype.prefetch = function() {
  return this.findFiles();
};

FilesService.prototype.renewFindFiles = function() {
  return this.cache.renew(FIND_FILES, this.findFiles);
};

FilesService.prototype.findFiles = function() {
  return this.cache.getOrInit(FIND_FILES, this._findFiles);
};

FilesService.prototype._findFiles = function() {
  return Promise
    .all([
      this.findFSFiles().then(files => mergeFiles(this.models, files)),
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

FilesService.prototype.findFSFiles = function() {
  return this.cache.getOrInit(FIND_FS_FILES, this._findFSFiles);
};

FilesService.prototype._findFSFiles = function() {
  return findFiles(this.rootDir);
};

FilesService.prototype.findDlnaFiles = function() {
  if (process.env.NODE_ENV === 'production') {
    return dlnaQuery()
      .then(null, err => {
        report(err);
        return Promise.resolve([]);
      });
  } else {
    return Promise.resolve([]);
  }
};

FilesService.prototype.findFilesWithStreamUrls = function(host) {
  return this
    .findFiles()
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

FilesService.prototype.addFile = function() {
  return this.models.File
    .add(...arguments)
    .then(res => {
      this.renewFindFiles();
      return res;
    });
};

FilesService.prototype.updateFile = function() {
  return this.models.File
    .update(...arguments)
    .then(res => {
      this.renewFindFiles();
      return res;
    });
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

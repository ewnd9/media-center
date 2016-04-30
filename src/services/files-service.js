import findFiles from '../find-files';
import Cache from '../utils/cache';
import proxy from '../utils/proxy';

export const FIND_FILES = 'FIND_FILES';

function FilesService(models, rootDir) {
  this.cache = new Cache();

  this.models = models;
  this.rootDir = rootDir;

  this.findFiles = findFiles.bind(null, this.models, this.rootDir);

  this._addFile = proxy(models.File, models.File.add);
  this._updateFile = proxy(models.File, models.File.update);

  this.renewFindAllFiles = this.renewFindAllFiles.bind(this);
}

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

export default FilesService;

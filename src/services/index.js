import Registry from '@ewnd9/registry';

import createFilesService from './files-service';
import createPlayerService from './player-service';
import TraktService from './trakt-service';

function init(db, storage, config) {
  const registry = new Registry('services');
  registry.define('configService', config);

  registry.define('filesService', createFilesService(db, config.mediaPath, config.mediaTrashPath));
  registry.define('playerService', createPlayerService(config.trakt));
  registry.define('traktService', new TraktService(config.trakt, config.dbPath, config.tmdbApi, db));

  return registry.services;
}

export default init;

import Registry from '@ewnd9/registry';

import createFilesService from './files-service';
import createPlayerService from './player-service';

function init(db, MEDIA_PATH, trakt) {
  const registry = new Registry('services');

  registry.define('filesService', createFilesService(db, MEDIA_PATH));
  registry.define('playerService', createPlayerService(trakt));

  return registry.services;
}

export default init;

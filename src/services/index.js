import Registry from '@ewnd9/registry';

import createFilesService from './files-service';
import createPlayerService from './player-service';
import createTraktService from './trakt-service';
import createMarksService from './marks-service';

function init(db, MEDIA_PATH, trakt, storage) {
  const registry = new Registry('services');

  registry.define('filesService', createFilesService(db, MEDIA_PATH));
  registry.define('marksService', createMarksService(db, storage));

  registry.define('playerService', createPlayerService(trakt));
  registry.define('traktService', createTraktService(trakt));

  return registry.services;
}

export default init;

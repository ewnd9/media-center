import Registry from '@ewnd9/registry';

import createFilesService from './files-service';
import createPlayerService from './player-service';
import createTraktService from './trakt-service';
import createMarksService from './marks-service';

function init(db, storage, config) {
  const registry = new Registry('services');
  registry.define('configService', config);

  registry.define('filesService', createFilesService(db, config.mediaPath));
  registry.define('marksService', createMarksService(db, storage));

  registry.define('playerService', createPlayerService(config.trakt));
  registry.define('traktService', createTraktService(config.trakt, config.dbPath));

  return registry.services;
}

export default init;

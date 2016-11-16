import Registry from '@ewnd9/registry';

import createFilesService from './files-service';
import createPlayerService from './player-service';

import TraktService from './trakt-service';
import TmdbService from './tmdb-service';
import PersonsService from './persons-service';
import RecommendationsService from './recommendations-service';

function init(db, storage, config) {
  const registry = new Registry('services');
  registry.define('configService', config);

  registry.define('filesService', createFilesService(db, config.mediaPath, config.mediaTrashPath));
  registry.define('playerService', createPlayerService(config.trakt));
  registry.define('traktService', new TraktService(config, db));
  registry.define('tmdbService', new TmdbService(config, db));
  registry.define('personsService', new PersonsService(config, db));
  registry.define('recommendationsService', new RecommendationsService(config, db));

  return registry.services;
}

export default init;

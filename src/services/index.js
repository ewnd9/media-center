import Registry from '@ewnd9/registry';

import FilesService from './files-service';
import PlayerService from './player-service';
import TraktService from './trakt-service';
import TmdbService from './tmdb-service';
import PersonsService from './persons-service';
import RecommendationsService from './recommendations-service';
import PostersService from './posters-service';

function init(db, storage, config) {
  const registry = new Registry('services');
  registry.define('configService', config);

  registry.define('filesService', new FilesService(config, db));
  registry.define('playerService', new PlayerService(config));
  registry.define('traktService', new TraktService(config, db));
  registry.define('tmdbService', new TmdbService(config, db));
  registry.define('personsService', new PersonsService(config, db));
  registry.define('recommendationsService', new RecommendationsService(config, db));
  registry.define('postersService', new PostersService(config, db));

  return registry.services;
}

export default init;

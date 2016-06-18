import storage from './storage';

import createDb from './models/index';
import createServices from './services/index';
import createServer from './server';

import * as config from './config';

export default function start(errorBoard) {
  return createDb(config.dbPath + '/db')
    .then(db => {
      const services = createServices(db, storage, config);
      return createServer({ db, services, errorBoard, config });
    });
}

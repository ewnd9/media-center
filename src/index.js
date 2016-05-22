import storage from './storage';

import createDb from './models/index';
import createServices from './services/index';
import createServer from './server';

import {
  dbPath,
  mediaPath,
  screenshotPath,
  trakt,
  port
} from './config';

function createApp() {
  return createDb(dbPath + '/db')
    .then(db => {
      const services = createServices(db, mediaPath, trakt, storage, dbPath);
      return createServer({ db, services, screenshotPath, port });
    });
}

export default createApp;

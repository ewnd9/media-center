import storage from './storage';

import createDb from './models/index';
import createServices from './services/index';
import createServer from './server';

import {
  dbPath,
  mediaPath,
  screenshotPath,
  errorBoardMount,
  trakt,
  port
} from './config';

export default function start(errorBoard) {
  return createDb(dbPath + '/db')
    .then(db => {
      const services = createServices(db, mediaPath, trakt, storage, dbPath);
      return createServer({ db, services, screenshotPath, port, errorBoard, errorBoardMount });
    });
}

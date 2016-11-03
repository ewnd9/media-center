import storage from './storage';

import createDb from './models/index';
import createServices from './services/index';
import createServer from './server';

import * as config from './config';
import report from './agent';

process.on('uncaughtException', function (err) {
  console.error('global exception:', err.stack || err);
  report(err);
});

process.on('unhandledRejection', function (reason) {
  console.error('unhandled promise rejection:', reason.stack || reason);
  report(reason);
});

export default function start() {
  return createDb(config.dbPath + '/db')
    .then(db => {
      const services = createServices(db, storage, config);
      return createServer({ db, services, config });
    });
}

if (!module.parent) {
  start();
}

import PouchDB from 'pouchdb';
import createModel from '../libs/pouchdb-repository-factory/';

import File from './file';
import Prefix from './prefix';

export default dbPath => {
  const initializers = {
    File,
    Prefix
  };

  const models = Object
    .keys(initializers)
    .reduce((result, key) => {
      const db = new PouchDB(`${dbPath}-${key.toLowerCase()}`);
      result[key] = createModel(db, initializers[key].createId);

      return result;
    }, {});

  Object
    .keys(models)
    .forEach(key => {
      initializers[key].associate(models);
    });

  return models;
};

import PouchDB from 'pouchdb';
import Repository from '../libs/pouchdb-repository-factory/';

import File from './file';
import Prefix from './prefix';
import Mark from './mark';

export default dbPath => {
  const initializers = {
    File,
    Prefix,
    Mark
  };

  const models = Object
    .keys(initializers)
    .reduce((result, key) => {
      const db = new PouchDB(`${dbPath}-${key.toLowerCase()}`);
      result[key] = new Repository(db, initializers[key].createId, initializers[key].indexes);

      return result;
    }, {});

  const promises = Object
    .keys(models)
    .map(key => {
      initializers[key].associate(models);
      return models[key].ensureIndexes();
    });

  return Promise.all(promises).then(() => models);
};

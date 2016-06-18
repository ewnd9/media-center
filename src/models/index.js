import PouchDB from 'pouchdb';
import Repository from '../libs/pouchdb-repository-factory/';

import File from './file';
import Prefix from './prefix';
import Mark from './mark';
import Subtitles from './subtitles';

export default (dbPath, dbOptions = {}) => {
  const initializers = {
    File,
    Prefix,
    Mark,
    Subtitles
  };

  const models = Object
    .keys(initializers)
    .reduce((result, key) => {
      const db = new PouchDB(`${dbPath}-${key.toLowerCase()}`, dbOptions);
      const obj = initializers[key];

      result[key] = new Repository(db, obj.createId, obj.indexes, obj.schema);

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

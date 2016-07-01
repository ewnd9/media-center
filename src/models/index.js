import PouchDB from 'pouchdb';
import t from 'tcomb-validation';
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
      db.on('error', err => console.log('pouch-error', err));

      const obj = initializers[key];
      const validate = validateFactory(obj.schema);

      result[key] = new Repository(db, obj.createId, obj.indexes, validate);

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

function validateFactory(schema) {
  if (!schema) {
    return obj => Promise.resolve(obj);
  }

  return obj => {
    const result = t.validate(obj, schema, { strict: true });

    if (result.isValid()) {
      return Promise.resolve(obj);
    }

    return Promise.reject(result.errors);
  };
}

import PouchDB from 'pouchdb-node';
import t from 'tcomb-validation';
import Model from 'pouchdb-model';

import MigratePlugin from 'pouchdb-migrate';

PouchDB.plugin(MigratePlugin);

import File from './file';
import Prefix from './prefix';

export default (dbPath, dbOptions = {}) => {
  const initializers = {
    File,
    Prefix
  };

  if (!('auto_compaction' in dbOptions)) {
    dbOptions.auto_compaction = true;
  }

  const models = Object
    .keys(initializers)
    .reduce((result, key) => {
      const name = key.toLowerCase();

      const db = new PouchDB(`${dbPath}-${name}`, dbOptions);
      db.on('error', err => console.log('pouch-error', err));

      const obj = initializers[key];
      const validate = validateFactory(obj.schema);

      result[key] = new Model(db, obj, validate);

      return result;
    }, {});

  const promises = Object
    .keys(models)
    .map(key => {
      initializers[key].associate(models);

      return models[key].db.compact()
        .then(() => models[key].ensureMigrations())
        .then(() => models[key].ensureIndexes());
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

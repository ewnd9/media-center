import model from '../libs/pouchdb-repository-factory/';

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
      result[key] = model(dbPath, key.toLowerCase(), initializers[key].createId);
      return result;
    }, {});

  Object
    .keys(models)
    .forEach(key => {
      initializers[key].associate(models);
    });

  return models;
};

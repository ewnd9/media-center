'use strict';

const PouchDB = require('pouchdb-node');

/*
node db-select <path-to-db> <prefix>
*/

module.exports = function(path, id) {
  const pouch = new PouchDB(path);
  return pouch.get(id);
};

module.exports(process.argv[2], process.argv[3])
  .then(res => {
    console.log(require('util').inspect(res, { depth: null }));
  })
  .catch(err => console.log(err.stack || err));

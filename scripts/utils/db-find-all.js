'use strict';

const PouchDB = require('pouchdb-node');

module.exports = function(path, prefix) {
  const pouch = new PouchDB(path);

  return pouch
    .allDocs({
      include_docs: true,
      startkey: prefix,
      endkey: `${prefix}\uffff`
    }).then(function (result) {
      return { pouch, result };
    });
};

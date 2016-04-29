'use strict';

const findAll = require('./utils/db-find-all');

findAll(process.argv[2], process.argv[3])
  .then(res => {
    const docs = res.result.rows.map(row => {
      row.doc._deleted = true;
      return row.doc;
    });

    return res.pouch.bulkDocs(docs);
  })
  .then(res => console.log(res))
  .catch(err => console.log(err.stack || err));

/*
node db-remove <path-to-db> <prefix>
*/

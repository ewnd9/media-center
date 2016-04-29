'use strict';

const findAll = require('./utils/db-find-all');

findAll(process.argv[2], process.argv[3])
  .then(res => {
    console.log(res.result);
  })
  .catch(err => console.log(err.stack || err));

/*
node db-select <path-to-db> <prefix>
*/

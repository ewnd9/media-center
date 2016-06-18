'use strict';

if (process.argv.length < 5) {
  throw new Error(`Usage: $ node root-media-path-migration <.../media-center-data/media-center-db/db> <old-prefix> <action>`);
}

const dbPath = process.argv[2];
const oldPrefix = process.argv[3];
const action = process.argv[4];

const createDb = require('../../lib/models/index').default;
createDb(dbPath)
  .then(models => {
    const File = models.File;

    return File.db
      .allDocs({
        include_docs: true,
      })
      .then(files => {
        files.rows.forEach(file => {
          if (action === 'list') {
            console.log(file);
          } else if (action === 'replace') {

            File.db
              .remove(file.doc)
              .then(() => {
                const doc = file.doc;

                doc._id = doc._id
                  .replace(`file:file:${oldPrefix}`, `file:`)
                  .replace(`file:${oldPrefix}`, `file:`);
                  
                delete doc._rev;

                return File.db.put(doc);
              })
              .catch(err => console.log(err.stack || err));
          }
        });
      });
  })
  .catch(err => console.log(err.stack || err));

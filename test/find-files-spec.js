import test from 'ava';
import 'babel-core/register';

import { validate } from 'tcomb-validation';

import findFiles from './../src/find-files';
import createDb from './fixtures/create-db';

/*

testing `findFiles` logic (map fs files with local db metadata)

*/

import {
  mockFs,
  unmockFs,

  testDir,
  showFolder,

  showTitle,
  showImdb,

  showFile1,
  showFile2,
  showFile3,
  showFile4,

  movieFolder,
  movieFile,

  movieTitle
} from './fixtures/create-fs';

import { filesArrayResponseSchema } from './fixtures/api-schemas';

async function addMockFile(db) {
  const res = await db.File.add([showFolder, showFile1].join('/'), {
    type: 'show',
    title: showTitle,
    s: 1,
    ep: 1,
    imdb: showImdb
  });

  return res;
}

test('#findFiles add new file', async t => {
  const db = await createDb();
  const res = await addMockFile(db);

  const data = await db.Prefix.db.allDocs({
    include_docs: true
  });

  t.truthy(data.total_rows === 1);
  t.truthy(data.rows[0].id === 'prefix:Master of None');
});

test('#findFiles', async t => {
  const db = await createDb();
  const res = await addMockFile(db);

  mockFs();

  const result = await findFiles(db, testDir);
  const errors = validate(result, filesArrayResponseSchema, { strict: true }).errors;

  if (errors.length > 0) {
    throw errors;
  }

  const r0 = result[0].media[0];
  t.is(r0.dir, movieFolder);
  t.is(r0.file, [movieFolder, movieFile].join('/'));
  t.is(r0.db, undefined);
  t.is(r0.recognition.type, 'movie');
  t.is(r0.recognition.title, movieTitle);
  t.is(r0.recognition.year, 2015);

  t.is(result[1].dir, showFolder);

  const items = result[1].media;
  t.is(items.length, 2);
  t.is(items[0].file, [showFolder, showFile1].join('/'));

  t.is(items[0].db.title, showTitle);
  t.is(items[0].db.imdb, showImdb);
  t.truthy(items[0].db._id);

  t.is(items[0].recognition.type, 'show');
  t.truthy(items[0].recognition.title === showTitle);
  t.is(items[0].recognition.s, 1);
  t.is(items[0].recognition.ep, 1);

  t.is(items[1].file, [showFolder, showFile2].join('/'));

  t.is(items[1].db.title, showTitle);
  t.is(items[1].db.imdb, showImdb);
  t.falsy(items[1].db._id);

  t.is(items[1].recognition.type, 'show');
  t.is(items[1].recognition.title, showTitle);
  t.is(items[1].recognition.s, 1);
  t.is(items[1].recognition.ep, 2);

  unmockFs();
});

import test from 'ava';
import 'babel-core/register';

import findFiles from './../src/find-files';
import createDb from './fixtures/create-db';

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

  movieTitle,

  nearestDate,
  pastDate
} from './fixtures/create-fs';

async function addMockFile(db) {
  const res = await db.File.add([testDir, showFolder, showFile1].join('/'), {
    type: 'show',
    title: showTitle,
    s: 1,
    e: 1,
    imdb: showImdb
  });

  return res;
}

test('#findFiles add new file', async t => {
  const db = createDb();
  const res = await addMockFile(db);

  const data = await db.Prefix.db.allDocs({
    include_docs: true
  });

  t.truthy(data.total_rows === 1);
  t.truthy(data.rows[0].id === 'prefix:Master of None');
});

test('#findFiles', async t => {
  const db = createDb();
  const res = await addMockFile(db);

  mockFs();

  const result = await findFiles(db, testDir);
  const r0 = result[0].media[0];

  t.is(r0.birthtime, nearestDate);
  t.is(r0.dir, [testDir, movieFolder].join('/'));
  t.is(r0.file, [testDir, movieFolder, movieFile].join('/'));
  t.is(r0.db, undefined);
  t.is(r0.recognition.type, 'movie');
  t.is(r0.recognition.title, movieTitle);
  t.is(r0.recognition.year, 2015);

  t.is(result[1].dir, [testDir, showFolder].join('/'));
  t.is(result[1].media[0].birthtime, pastDate);

  const items = result[1].media;
  t.is(items.length, 2);
  t.is(items[0].file, [testDir, showFolder, showFile1].join('/'));

  t.is(items[0].db.title, showTitle);
  t.is(items[0].db.imdb, showImdb);
  t.truthy(items[0].db._id);

  t.is(items[0].recognition.type, 'show');
  t.truthy(items[0].recognition.title === showTitle);
  t.is(items[0].recognition.s, 1);
  t.is(items[0].recognition.ep, 1);

  t.is(items[1].file, [testDir, showFolder, showFile2].join('/'));

  t.is(items[1].db.title, showTitle);
  t.is(items[1].db.imdb, showImdb);
  t.falsy(items[1].db._id);

  t.is(items[1].recognition.type, 'show');
  t.is(items[1].recognition.title, showTitle);
  t.is(items[1].recognition.s, 1);
  t.is(items[1].recognition.ep, 2);

  unmockFs();
});

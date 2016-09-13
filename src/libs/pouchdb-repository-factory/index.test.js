import test from 'ava';
import 'babel-core/register';

import PouchDB from 'pouchdb-node';
PouchDB.plugin(require('pouchdb-adapter-memory'));

import Model from './index';

test('Create correct subtitles model', async t => {
  const db = new PouchDB('test', { adapter: 'memory' });
  const model = new Model(db, ({ name }) => name);

  const items = await model.findAll();
  t.truthy(items.rows.length === 0);
});

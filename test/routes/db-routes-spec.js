import test from 'ava';

import agent from '../fixtures/agent';
import createApp from '../fixtures/create-app';

import { generateMark } from '../fixtures/mocks-marks';
import PouchDB from 'pouchdb';
import str from 'string-to-stream';
import getStream from 'get-stream';
import concat from 'concat-stream';

import t from 'tcomb';
const stringTcomb = t.struct({ data: t.String });

test.beforeEach(async t => {
  t.context.app = await createApp();
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

import {
  statusStringResponse
} from '../fixtures/api-schemas';

test('GET /api/v1/db/:name', async t => {
  const mark0 = generateMark();
  const markEntity0 = await t.context.app.services.marksService.add(mark0);

  const { text } = await t.context.request.get('/api/v1/db/mark', {}, false);
  const db = new PouchDB('test-get', { adapter: 'memory' });

  const docs0 = await db.allDocs({ include_docs: true });
  t.truthy(docs0.rows.length === 0);

  await db.load(str(text));

  const docs1 = await db.allDocs({ include_docs: true });
  t.truthy(docs1.rows.length === 2);
});

test('POST /api/v1/db/:name', async t => {
  const db = new PouchDB('test-post', { adapter: 'memory' });
  const mark = await db.put({ _id: 'test', test: true });

  const docs0 = await t.context.app.services.marksService.Mark.db.allDocs({ include_docs: true });
  t.truthy(docs0.rows.length === 1);

  const dump = await new Promise(resolve => {
    db.dump(concat(res => {
      resolve(res)
    }));
  });

  const { body } = await t.context.request.supertest.post('/api/v1/db/mark')
    .set('Content-Type', 'text/plain')
    .send(dump);

  t.truthy(body.status === 'ok');

  const docs1 = await t.context.app.services.marksService.Mark.db.allDocs({ include_docs: true });
  t.truthy(docs1.rows.length === 2);
  t.truthy(docs1.rows[1].id && docs1.rows[1].id === mark.id);
});

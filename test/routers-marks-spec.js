import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import { agent } from 'supertest';
import createApp from './fixtures/create-app';
import { generateMark } from './fixtures/mocks-marks';

test.beforeEach(async t => {
  t.context.app = await createApp({});
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

test('GET /api/v1/marks', async t => {
  var { body } = await t.context.request.get('/api/v1/marks');
  t.truthy(body.length === 0);

  const mark0 = generateMark();
  const markEntity0 = await t.context.app.services.marksService.add(mark0);

  var { body } = await t.context.request.get('/api/v1/marks');

  t.truthy(body.length === 1);
  t.truthy(body[0]._id = markEntity0._id);

  const mark1 = generateMark();
  const markEntity1 = await t.context.app.services.marksService.add(mark1);

  var { body } = await t.context.request.get('/api/v1/marks');

  t.truthy(body.length === 2);
  t.truthy(body[0]._id = markEntity1._id);
  t.truthy(body[1]._id = markEntity0._id);

  var { body } = await t.context.request.get('/api/v1/marks').query({ limit: 1, since: body[0]._key });
  t.truthy(body.length === 1);
  t.truthy(body[0]._id === markEntity0._id);
});

test('GET /api/v1/marks', async t => {
  const mark = generateMark();
  const { body } = await t.context.request.post('/api/v1/marks').send({ mark });
  const markDb = await t.context.app.db.Mark.findById(body._id);

  t.truthy(markDb.imdb === mark.media.imdb);
  t.truthy(markDb.marks.length === 1);
  t.truthy(markDb.marks[0].position === mark.position);
  t.truthy(markDb.marks[0].duration === mark.duration);
  t.truthy(markDb.marks[0].progress === mark.progress);
});

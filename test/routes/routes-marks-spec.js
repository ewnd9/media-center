import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import agent from '../fixtures/agent';
import createApp from '../fixtures/create-app';
import { generateMark } from '../fixtures/mocks-marks';

test.beforeEach(async t => {
  t.context.app = await createApp({});
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

import {
  markRequestSchema,
  markResponseSchema,
  marksArrayResponseSchema
} from '../fixtures/api-schemas';

test('GET /api/v1/marks', async t => {
  const { body: body0 } = await t.context.request.get('/api/v1/marks', {}, marksArrayResponseSchema);
  t.truthy(body0.length === 0);

  const mark0 = generateMark();
  const markEntity0 = await t.context.app.services.marksService.add(mark0);

  const { body: body1 } = await t.context.request.get('/api/v1/marks', {}, marksArrayResponseSchema);
  t.truthy(body1.length === 1);
  t.truthy(body1[0]._id = markEntity0._id);

  const mark1 = generateMark();
  const markEntity1 = await t.context.app.services.marksService.add(mark1);

  const { body: body2 } = await t.context.request.get('/api/v1/marks', {}, marksArrayResponseSchema);

  t.truthy(body2.length === 2);
  t.truthy(body2[0]._id = markEntity1._id);
  t.truthy(body2[1]._id = markEntity0._id);

  const { body: body3 } = await t.context.request.get('/api/v1/marks', { limit: 1, since: body2[0]._key }, marksArrayResponseSchema);
  t.truthy(body3.length === 1);
  t.truthy(body3[0]._id === markEntity0._id);
});

test('POST /api/v1/marks', async t => {
  const mark = generateMark();
  const { body } = await t.context.request.post('/api/v1/marks', { mark }, markRequestSchema, markResponseSchema);
  const markDb = await t.context.app.db.Mark.findById(body._id);

  t.truthy(markDb.imdb === mark.media.imdb);
  t.truthy(markDb.marks.length === 1);
  t.truthy(markDb.marks[0].position === mark.position);
  t.truthy(markDb.marks[0].duration === mark.duration);
  t.truthy(markDb.marks[0].progress === mark.progress);
});

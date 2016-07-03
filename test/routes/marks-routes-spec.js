import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import agent from '../fixtures/agent';
import createApp from '../fixtures/create-app';

import { generateMark } from '../fixtures/mocks-marks';
import MarksService from '../../src/services/marks-service';

import fs from 'fs';
const srtText = fs.readFileSync('../fixtures/srt/game-of-thrones-06x10-sample.srt', 'utf-8');

test.beforeEach(async t => {
  const MarksServiceMock = function() {
    const service = MarksService.apply(this, Array.prototype.slice.apply(arguments));

    service._fetchSubtitlesFromApi = function() {
      return Promise.resolve(srtText);
    };

    return service;
  };

  t.context.app = await createApp({ marksServiceMock: { default: MarksServiceMock } });
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

import {
  markRequestSchema,
  markResponseSchema,
  markSubtitlesResponseSchema,
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

test('GET /api/v1/marks/:id', async t => {
  const mark0 = generateMark();
  const markEntity0 = await t.context.app.services.marksService.add(mark0);

  const { body } = await t.context.request.get(`/api/v1/marks/${markEntity0._id}`, {}, markSubtitlesResponseSchema);
  t.truthy(body._id === markEntity0._id);
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

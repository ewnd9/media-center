import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import agent from '../fixtures/agent';
import createApp from '../fixtures/create-app';
import { generateMedia } from '../fixtures/mocks-media';

test.beforeEach(async t => {
  const addToHistory = sinon.stub().returns(Promise.resolve());
  const getReport = sinon.stub().returns(Promise.resolve());
  const search = sinon.stub().returns(Promise.resolve());

  const traktMock = {
    addToHistory,
    getReport,
    search
  };

  const { db, server } = await createApp({ traktMock });

  t.context.db = db;
  t.context.server = server;
  t.context.request = agent(server);

  t.context.traktMock = traktMock;
});

test.afterEach(t => {
  t.context.server.close();
});

import {
  fileScrobbleRequestSchema,
  filePositionRequestSchema,
  fileResponseSchema,
  statusStringResponse
} from '../fixtures/api-schemas';

test('POST /api/v1/files/scrobble', async t => {
  const filename = 'movie.avi';
  const media = {
    imdb: 'tt0',
    type: 'show',
    title: 'First Imdb Movie'
  };

  const d0 = await t.context.db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  const result = await t.context.request.post('/api/v1/files/scrobble', {
    filename,
    media
  }, fileScrobbleRequestSchema, statusStringResponse);

  t.truthy(t.context.traktMock.addToHistory.calledOnce === true);
  t.deepEqual(media, t.context.traktMock.addToHistory.firstCall.args[0]);

  const d1 = await t.context.db.File.findOne(filename);

  t.is(true, d1.scrobble);
  t.not(d0.updatedAt, d1.updatedAt);
});

test('POST /api/v1/files/position', async t => {
  const filename = 'movie.avi';
  const media = generateMedia();

  const { body } = await t.context.request.post('/api/v1/files/position', {
    filename,
    media,
    position: 0,
    duration: 0
  }, filePositionRequestSchema, fileResponseSchema);

  t.truthy(media.imdb === body.file.imdb);
});

import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import { agent } from 'supertest';
import createApp from './fixtures/create-app';

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

test('/api/v1/files/scrobble', async t => {
  const filename = 'movie.avi';
  const media = {
    imdb: 'tt0',
    type: 'show',
    title: 'First Imdb Movie'
  };

  const d0 = await t.context.db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  const result = await t.context.request.post('/api/v1/files/scrobble').send({
    filename,
    media
  });

  t.truthy(t.context.traktMock.addToHistory.calledOnce === true);
  t.deepEqual(media, t.context.traktMock.addToHistory.firstCall.args[0]);

  const d1 = await t.context.db.File.findOne(filename);

  t.is(true, d1.scrobble);
  t.not(d0.updatedAt, d1.updatedAt);
});

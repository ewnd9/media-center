import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import { agent } from 'supertest';
import createApp from './fixtures/create-app';

test('/api/v1/files/scrobble', async t => {
  const addToHistory = sinon.stub().returns(Promise.resolve());
  const getReport = sinon.stub().returns(Promise.resolve());
  const search = sinon.stub().returns(Promise.resolve());

  const traktMock = {
    addToHistory,
    getReport,
    search
  };

  const { server, db } = await createApp({ traktMock });
  const request = agent(server);

  const filename = 'movie.avi';
  const media = { imdb: 'tt0' };

  const d0 = await db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  const result = await request.post('/api/v1/files/scrobble').send({
    filename,
    media
  });

  t.truthy(addToHistory.calledOnce === true);
  t.deepEqual(media, addToHistory.firstCall.args[0]);

  const d1 = await db.File.get(filename);
  t.is(true, d1.scrobble);
  t.not(d0.updatedAt, d1.updatedAt);
});

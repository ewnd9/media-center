import test from 'ava';
import 'babel-core/register';
import got from 'got';
import sinon from 'sinon';
import Promise from 'bluebird';

import createServer from './fixtures/create-server';
import Router from './../src/routes/index';
import createDb from './../src/db';

const port = 4005;
const post = async (url, body) => {
  const response = await got(`http://localhost:${port}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return response.body;
};

test('/api/v1/files/scrobble', async t => {
  const port = 4005;
  const db = createDb('/tmp/x' + Math.random());

  const addToHistory = sinon.stub().returns(Promise.resolve());
  const trakt = {
    addToHistory
  };

  const router = Router(null, db, trakt, null);
  const server = await createServer(port, router);

  const filename = 'movie.avi';
  const media = { imdb: 'tt0' };

  const d0 = await db.updateFile(filename, media);
  t.is(media.imdb, d0.imdb);

  const result = await post('/api/v1/files/scrobble', {
    filename,
    media
  });

  t.is(true, addToHistory.calledOnce);
  t.same(media, addToHistory.firstCall.args[0]);

  const d1 = await db.getFile(filename);
  t.is(true, d1.scrobble);
  t.not(d0.updatedAt, d1.updatedAt);

});

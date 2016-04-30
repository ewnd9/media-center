import test from 'ava';
import 'babel-core/register';
import got from 'got';
import sinon from 'sinon';
import Promise from 'bluebird';

import createServer from './fixtures/create-server';
import createDb from './fixtures/create-db';

import FilesService from '../src/services/files-service';
import Router from './../src/routes/index';

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
  const db = createDb();

  const addToHistory = sinon.stub().returns(Promise.resolve());
  const getReport = sinon.stub().returns(Promise.resolve());

  const trakt = {
    addToHistory,
    getReport
  };

  const filesService = new FilesService(db, '');

  const router = Router(filesService, trakt, null);
  const server = await createServer(port, router);

  const filename = 'movie.avi';
  const media = { imdb: 'tt0' };

  const d0 = await db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  const result = await post('/api/v1/files/scrobble', {
    filename,
    media
  });

  t.is(true, addToHistory.calledOnce);
  t.deepEqual(media, addToHistory.firstCall.args[0]);

  const d1 = await db.File.get(filename);
  t.is(true, d1.scrobble);
  t.not(d0.updatedAt, d1.updatedAt);
});

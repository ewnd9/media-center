import test from 'ava';

import sinon from 'sinon';

import createApp from '../fixtures/create-app';
import Agent from '../../src/libs/express-router-tcomb-agent';

import { generateMedia } from '../fixtures/mocks-media';
import { createFile, isFileExists } from '../fixtures/create-fs-files';

test.beforeEach(async t => {
  const addToHistory = sinon.stub().returns(Promise.resolve());
  const getReport = sinon.stub().returns(Promise.resolve());
  const search = sinon.stub().returns(Promise.resolve());
  const startScrobble = sinon.stub().returns(Promise.resolve());
  const request = sinon.stub().returns(Promise.resolve([]));

  const traktMock = {
    addToHistory,
    getReport,
    search,
    startScrobble,
    request
  };

  const { app, db, server, config } = await createApp({ traktMock });

  t.context.db = db;
  t.context.config = config;
  t.context.server = server;
  t.context.request = Agent(app, server);

  t.context.traktMock = traktMock;
});

test.afterEach(t => {
  t.context.server.close();
});

test('GET /api/v1/files', async t => {
  await t.context.request.get('/api/v1/files');
});

test('POST /api/v1/files/scrobble', async t => {
  const filename = 'movie.avi';
  const media = {
    imdb: 'tt0',
    type: 'show',
    title: 'First Imdb Movie'
  };

  const d0 = await t.context.db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  await t.context.request.post('/api/v1/files/scrobble', {
    body: {
      filename,
      media
    }
  });

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
    body: {
      filename,
      media,
      position: 0,
      duration: 0
    }
  });

  t.truthy(media.imdb === body.file.imdb);
});

test('POST /api/v1/files/hidden', async t => {
  const file = 'movie.avi';
  const filename = 'Title';

  const { body } = await t.context.request.post('/api/v1/files/hidden', {
    body: {
      file,
      filename
    }
  });

  t.truthy(body.status === 'ok');
});

test('POST /api/v1/playback/info', async t => {
  const filename = 'movie.avi';
  const media = generateMedia();

  const d0 = await t.context.db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  const { body } = await t.context.request.post('/api/v1/playback/info', {
    body: {
      filename,
      media
    }
  });

  t.truthy(body.status === 'ok');
});

test('POST /api/v1/playback/start', async t => {
  const stub = sinon.stub().returns(Promise.resolve());
  const playerServiceMock = {
    default: () => ({ play: stub })
  };

  const app = await createApp({ playerServiceMock });
  const request = Agent(app.app, app.server);

  const filename = 'movie.avi';
  const media = generateMedia();

  const d0 = await app.db.File.update(filename, media);
  t.truthy(media.imdb === d0.imdb);

  const traktScrobble = true;

  const { body } = await request.post('/api/v1/playback/start', {
    body: {
      filename,
      media,
      noScrobble: traktScrobble
    }
  });

  t.truthy(body.status === 'ok');
  t.truthy(stub.calledOnce === true);
  t.truthy(stub.firstCall.args[0].uri === filename);
  t.truthy(stub.firstCall.args[0].traktScrobble === !traktScrobble);
});

import BasePlayer from '../../src/players/base';

test('GET /api/v1/playback/status', async t => {
  const player = new BasePlayer(t.context.trakt);
  const media = generateMedia();
  const uri = 'movie.avi';

  player.play({ uri, media, position: 1, traktScrobble: false });
  player.duration = 10;

  const playerServiceMock = {
    default: () => player
  };

  const app = await createApp({ playerServiceMock });
  const request = Agent(app.app, app.server);

  await request.get('/api/v1/playback/status');
});

test('DELETE /api/v1/files/:filename', async t => {
  const file = 'a/b.avi';
  const fullPath = `${t.context.config.mediaPath}/${file}`;
  const trashPath = `${t.context.config.mediaTrashPath}/${file}`;

  await createFile(fullPath);

  t.truthy(await isFileExists(fullPath));
  t.falsy(await isFileExists(trashPath));

  await t.context.request.delete(`/api/v1/files/:filename`, {
    params: {
      filename: file
    }
  });

  t.falsy(await isFileExists(fullPath));
  t.truthy(await isFileExists(trashPath));
});

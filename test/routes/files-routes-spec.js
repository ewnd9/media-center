import test from 'ava';
import 'babel-core/register';

import sinon from 'sinon';
import Promise from 'bluebird';

import agent from '../fixtures/agent';
import createApp from '../fixtures/create-app';
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

  const { db, server, config } = await createApp({ traktMock });

  t.context.db = db;
  t.context.config = config;
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
  fileHiddenRequestSchema,
  playbackStartRequestSchema,
  fileResponseSchema,
  statusStringResponse,
  filesArrayResponseSchema,
  playbackInfoResponseSchema
} from '../fixtures/api-schemas';

test('GET /api/v1/files', async t => {
  // const { body } = await t.context.request.get('/api/v1/files', {}, filesArrayResponseSchema);
  await t.context.request.get('/api/v1/files', {}, filesArrayResponseSchema);
  // real schema test in '/test/find-files-spec.js'
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

test('POST /api/v1/files/hidden', async t => {
  const file = 'movie.avi';
  const filename = 'Title';

  const { body } = await t.context.request.post('/api/v1/files/hidden', {
    file,
    filename
  }, fileHiddenRequestSchema, statusStringResponse);

  t.truthy(body.status === 'ok');
});

test('POST /api/v1/playback/info', async t => {
  const filename = 'movie.avi';
  const media = generateMedia();

  const d0 = await t.context.db.File.update(filename, media);
  t.is(media.imdb, d0.imdb);

  const { body } = await t.context.request.post('/api/v1/playback/info', {
    filename,
    media
  }, fileScrobbleRequestSchema, statusStringResponse);

  t.truthy(body.status === 'ok');
});

test('POST /api/v1/playback/start', async t => {
  const stub = sinon.stub().returns(Promise.resolve());
  const playerServiceMock = {
    default: () => ({ play: stub })
  };

  const app = await createApp({ playerServiceMock });
  const request = agent(app.server);

  const filename = 'movie.avi';
  const media = generateMedia();

  const d0 = await app.db.File.update(filename, media);
  t.truthy(media.imdb === d0.imdb);

  const traktScrobble = true;

  const { body } = await request.post('/api/v1/playback/start', {
    filename,
    media,
    noScrobble: traktScrobble
  }, playbackStartRequestSchema, statusStringResponse);

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
  const request = agent(app.server);

  // const { body } = await request.get('/api/v1/playback/status', {}, playbackInfoResponseSchema);
  await request.get('/api/v1/playback/status', {}, playbackInfoResponseSchema);
});

test('DELETE /api/v1/files/:filename', async t => {
  const { request } = t.context;

  const file = 'a/b.avi';
  const fullPath = `${t.context.config.mediaPath}/${file}`;
  const trashPath = `${t.context.config.mediaTrashPath}/${file}`;

  await createFile(fullPath);
  t.truthy(await isFileExists(fullPath));
  t.falsy(await isFileExists(trashPath));

  await request.delete(`/api/v1/files/${encodeURIComponent(file)}`, {}, statusStringResponse);

  t.falsy(await isFileExists(fullPath));
  t.truthy(await isFileExists(trashPath));
});

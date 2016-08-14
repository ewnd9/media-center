import test from 'ava';
import 'babel-core/register';

import { agent } from 'supertest';
import createApp from '../fixtures/create-app';
import { showImdb } from '../fixtures/create-fs';

test.beforeEach(async t => {
  t.context.app = await createApp({});
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

test('GET /api/v1/posters/placeholder.jpg', async t => {
  const { status } = await t.context.request.get('/api/v1/posters/placeholder.jpg');
  t.truthy(status === 200);
});

test('GET /api/v1/posters/:type/:imdb/:season*?', async t => {
  const { status } = await t.context.request.get(`/api/v1/posters/show/${showImdb}/1`);
  t.truthy(status === 200);
});

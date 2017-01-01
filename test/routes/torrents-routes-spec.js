import test from 'ava';

import createApp from '../fixtures/create-app';
import Agent from 'express-router-tcomb-test';

test.beforeEach(async t => {
  t.context.app = await createApp({});
  t.context.request = Agent(t.context.app.app, t.context.app.server);
});

test.afterEach(async t => {
  t.context.app.server.close();
});

test.serial('POST /api/v1/torrents', async t => {
  const { app: { services: { torrentsService } } } = t.context;
  const magnet = 'magnet';
  await t.context.request.post('/api/v1/torrents', { body: { magnet } });

  t.true(torrentsService.engine.add.calledOnce);
  t.true(torrentsService.engine.add.args[0].length === 2);
  t.true(torrentsService.engine.add.args[0][0] === magnet);
});

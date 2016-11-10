import test from 'ava';

import createApp from '../fixtures/create-app';
import Agent from '../../src/libs/express-router-tcomb-agent';

test.beforeEach(async t => {
  t.context.app = await createApp();
  t.context.agent = Agent(t.context.app.app, t.context.app.server);
});

test.afterEach(async t => {
  t.context.app.server.close();
});

test('GET /api/v1/screenshots', async t => {
  // const { body } = await t.context.request.get('/api/v1/screenshots', {}, screenshotsResponseSchema);
  await t.context.agent.get('/api/v1/screenshots', {});
  // rejection on schema mismatch
});

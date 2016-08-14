import test from 'ava';
import 'babel-core/register';

import createApp from '../fixtures/create-app';
import agent from '../fixtures/agent';

test.beforeEach(async t => {
  t.context.app = await createApp();
  t.context.request = agent(t.context.app.server);
});

test.afterEach(async t => {
  t.context.app.server.close();
});

import {
  screenshotsResponseSchema
} from '../fixtures/api-schemas';

test('GET /api/v1/screenshots', async t => {
  // const { body } = await t.context.request.get('/api/v1/screenshots', {}, screenshotsResponseSchema);
  await t.context.request.get('/api/v1/screenshots', {}, screenshotsResponseSchema);
  // rejection on schema mismatch
});

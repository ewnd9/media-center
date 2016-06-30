import test from 'ava';
import 'babel-core/register';

import createApp from '../fixtures/create-app';
import agent from '../fixtures/agent';
import trakt from '../fixtures/create-trakt';
import { showTitle } from '../fixtures/create-fs';

test.beforeEach(async t => {
  t.context.app = await createApp({ traktMock: trakt });
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

import {
  traktReportResponseSchema,
  traktSuggestionsResponseSchema
} from '../fixtures/api-schemas';

test('GET /api/v1/report', async t => {
  const { body } = await t.context.request.get('/api/v1/report', {}, traktReportResponseSchema);
  // rejection on schema mismatch
});

test('GET /api/v1/suggestions', async t => {
  const { body } = await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  // rejection on schema mismatch
});

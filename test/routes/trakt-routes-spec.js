import test from 'ava';
import 'babel-core/register';

import tk from 'timekeeper';

import createApp from '../fixtures/create-app';
import agent from '../fixtures/agent';
import createTrakt from '../fixtures/create-trakt';
import { showTitle } from '../fixtures/create-fs';
import { nockBefore } from '../helpers/nock';

test.beforeEach(async t => {
  t.context.app = await createApp({ traktMock: createTrakt(process.env.TRAKT_TOKEN) });
  t.context.request = agent(t.context.app.server);

  const nock = nockBefore(__filename, t);
  t.context.nockEnd = nock.afterFn;
});

test.afterEach(t => {
  t.context.app.server.close();
  t.context.nockEnd();
});

import {
  traktReportResponseSchema,
  traktSuggestionsResponseSchema
} from '../fixtures/api-schemas';

test.serial('GET /api/v1/report', async t => {
  const time = new Date(1467378356960); // july 1st 2016
  tk.freeze(time);

  const { body } = await t.context.request.get('/api/v1/report', {}, traktReportResponseSchema);
  // rejection on schema mismatch
  tk.reset();
});

test.serial('GET /api/v1/suggestions', async t => {
  const { body } = await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  // rejection on schema mismatch
});

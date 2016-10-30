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
  statusStringResponse,
  traktReportResponseSchema,
  traktSuggestionsResponseSchema
} from '../fixtures/api-schemas';

test.serial('GET /api/v1/trakt/report', async t => {
  const { services: { traktService }, db: { EpisodeScrobble } } = t.context.app;

  await traktService.syncShowsHistory();

  let docs;

  docs = await EpisodeScrobble.findAll();
  t.truthy(docs.length > 1500);

  const toDelete = docs.slice(10).map(doc => ({ _id: doc._id, _rev: doc._rev, _deleted: true }));
  await EpisodeScrobble.db.bulkDocs(toDelete);

  docs = await EpisodeScrobble.findAll();
  t.truthy(docs.length === 10);

  await t.context.request.get('/api/v1/trakt/report', {}, traktReportResponseSchema);
  // rejection on schema mismatch
});

test.serial('GET /api/v1/trakt/sync/shows', async t => {
  await t.context.request.get('/api/v1/trakt/sync/shows', {}, statusStringResponse);
  // rejection on schema mismatch
});

test.serial('GET /api/v1/suggestions', async t => {
  // const { body } = await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  // rejection on schema mismatch
});

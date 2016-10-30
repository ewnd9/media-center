import test from 'ava';
import 'babel-core/register';

import createApp from '../fixtures/create-app';
import agent from '../fixtures/agent';
import createTrakt from '../fixtures/create-trakt';
import { showTitle } from '../fixtures/create-fs';
import { nockBefore } from '../helpers/nock';

import tk from 'timekeeper';

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
  traktShowResponseSchema,
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

test.serial.only('GET /api/v1/trakt/shows/:imdb', async t => {
  const { body: { show: { syncedAt: syncedAt0 } } }  = await t.context.request.get('/api/v1/trakt/shows/tt2193021', {}, traktShowResponseSchema);
  // rejection on schema mismatch

  const { body: { show: { syncedAt: syncedAt1 } } }  = await t.context.request.get('/api/v1/trakt/shows/tt2193021', {}, traktShowResponseSchema);
  t.truthy(syncedAt0 === syncedAt1);

  tk.travel(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)); // + 20 days

  const { body: { show: { syncedAt: syncedAt2 } } }  = await t.context.request.get('/api/v1/trakt/shows/tt2193021', {}, traktShowResponseSchema);
  t.truthy(syncedAt0 !== syncedAt2);

  tk.reset();
});

test.serial('GET /api/v1/suggestions', async t => {
  // const { body } = await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  // rejection on schema mismatch
});

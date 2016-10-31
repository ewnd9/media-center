import test from 'ava';

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
  traktMovieResponseSchema,
  traktMoviesResponseSchema,
  traktReportResponseSchema,
  traktSuggestionsResponseSchema,
  dvdReleasesSuggestionsResponseSchema
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
  const { db: { EpisodeScrobble } } = t.context.app;

  const docs0 = await EpisodeScrobble.findAll();
  t.truthy(docs0.length === 0);

  await t.context.request.get('/api/v1/trakt/sync/shows', {}, statusStringResponse);
  // rejection on schema mismatch

  const docs1 = await EpisodeScrobble.findAll();
  t.truthy(docs1.length > 1500);
});

test.serial('GET /api/v1/trakt/sync/movies', async t => {
  const { db: { MovieScrobble } } = t.context.app;

  const docs0 = await MovieScrobble.findAll();
  t.truthy(docs0.length === 0);

  await t.context.request.get('/api/v1/trakt/sync/movies', {}, statusStringResponse);
  // rejection on schema mismatch

  const docs1 = await MovieScrobble.findAll();
  t.truthy(docs1.length > 200);
});

test.serial('GET /api/v1/trakt/shows/:imdb', async t => {
  const { body: { show: { syncedAt: syncedAt0 } } }  = await t.context.request.get('/api/v1/trakt/shows/tt2193021', {}, traktShowResponseSchema);
  // rejection on schema mismatch

  const { body: { show: { syncedAt: syncedAt1 } } }  = await t.context.request.get('/api/v1/trakt/shows/tt2193021', {}, traktShowResponseSchema);
  t.truthy(syncedAt0 === syncedAt1);

  tk.travel(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)); // + 20 days

  const { body: { show: { syncedAt: syncedAt2 } } }  = await t.context.request.get('/api/v1/trakt/shows/tt2193021', {}, traktShowResponseSchema);
  t.truthy(syncedAt0 !== syncedAt2);

  tk.reset();
});

test.serial('GET /api/v1/trakt/movies/:imdb', async t => {
  const { body: { movie } }  = await t.context.request.get('/api/v1/trakt/movies/tt1392190', {}, traktMovieResponseSchema);
  t.truthy(movie.title === 'Mad Max: Fury Road');
});

test.serial('GET /api/v1/suggestions', async t => {
  // const { body } = await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  await t.context.request.get('/api/v1/suggestions', { type: 'show', title: showTitle }, traktSuggestionsResponseSchema);
  // rejection on schema mismatch
});

test.serial('GET /api/v1/dvdreleasesdates/suggestions', async t => {
  const { body } = await t.context.request.get('/api/v1/dvdreleasesdates/suggestions', { query: 'captain america' }, dvdReleasesSuggestionsResponseSchema);
  // rejection on schema mismatch

  t.truthy(body.suggestions[0].title === 'Captain America: The Winter Soldier');
  t.truthy(body.suggestions[1].title === 'Captain America 3 Civil War');
});

test.serial('POST /api/v1/trakt/movies/release-date', async t => {
  const imdb = 'tt1392190';

  const fn0 = t.context.request.get(`/api/v1/trakt/movies/${imdb}`, {}, traktMovieResponseSchema);
  const { body: { movie: { releaseDate: releaseDate0 } } } = await fn0;

  t.truthy(!releaseDate0);

  const query = {
    imdb,
    releaseDate: new Date().toISOString()
  };

  const fn1 = t.context.request.postQuery('/api/v1/trakt/movies/release-date', query, traktMovieResponseSchema);
  const { body: { movie: { releaseDate: releaseDate1 } } } = await fn1;
  // rejection on schema mismatch

  t.truthy(releaseDate1);
});

test.serial('GET /api/v1/trakt/movies', async t => {
  const imdb = 'tt1392190';

  const query = {
    imdb,
    releaseDate: new Date().toISOString()
  };

  await t.context.request.postQuery('/api/v1/trakt/movies/release-date', query, traktMovieResponseSchema);

  const { body: { movies } } = await t.context.request.get('/api/v1/trakt/movies', {}, traktMoviesResponseSchema);
  // rejection on schema mismatch

  t.truthy(movies.length === 1);
  t.truthy(movies[0].imdb === imdb);
});

test.serial('Movie.releaseDateIndex complex', async t => {
  const fn = () => t.context.request.get('/api/v1/trakt/movies', {}, traktMoviesResponseSchema).then(({ body }) => body.movies.length);
  const imdb = 'tt1392190';

  await t.context.request.get(`/api/v1/trakt/movies/${imdb}`, {}, traktMovieResponseSchema);
  t.truthy((await fn()) === 0);

  const query = {
    imdb,
    releaseDate: new Date().toISOString()
  };

  await t.context.request.postQuery('/api/v1/trakt/movies/release-date', query, traktMovieResponseSchema);
  t.truthy((await fn()) === 1);

  await t.context.request.get('/api/v1/trakt/sync/movies', {}, statusStringResponse);
  t.truthy((await fn()) === 0);
});

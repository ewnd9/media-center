import test from 'ava';

import createApp from '../fixtures/create-app';
import Agent from 'express-router-tcomb-test';

import createTrakt from '../fixtures/create-trakt';
import { showTitle } from '../fixtures/create-fs';
import delay from 'delay';

import sinon from 'sinon';
import tk from 'timekeeper';
import nockHook from 'nock-hook/ava';

test.beforeEach(async t => {
  t.context.app = await createApp({ traktMock: createTrakt(process.env.TRAKT_TOKEN) });
  t.context.request = Agent(t.context.app.app, t.context.app.server);

  t.context.closeNock = nockHook(t, __filename, { dirname: __dirname + '/../fixtures/trakt-routes-spec' });
});

test.afterEach(t => {
  t.context.app.server.close();
  t.context.closeNock();
});

test.serial('GET /api/v1/trakt/report', async t => {
  const { services: { traktService }, db: { EpisodeScrobble } } = t.context.app;
  traktService.renewShowReport = sinon.stub();

  await traktService.syncShowsHistory();

  let docs;

  docs = await EpisodeScrobble.findAll();
  t.truthy(docs.length > 1500);

  const toDelete = docs.slice(10).map(doc => ({ _id: doc._id, _rev: doc._rev, _deleted: true }));
  await EpisodeScrobble.db.bulkDocs(toDelete);

  docs = await EpisodeScrobble.findAll();
  t.truthy(docs.length === 10);

  await t.context.request.get('/api/v1/trakt/report');
  // rejection on schema mismatch
  t.true(traktService.renewShowReport.calledOnce);
});

test.serial('GET /api/v1/trakt/sync/shows', async t => {
  const { db: { EpisodeScrobble }, services: { traktService } } = t.context.app;
  traktService.renewShowReport = sinon.stub();

  const docs0 = await EpisodeScrobble.findAll();
  t.truthy(docs0.length === 0);

  await t.context.request.get('/api/v1/trakt/sync/shows');
  // rejection on schema mismatch

  const docs1 = await EpisodeScrobble.findAll();
  t.truthy(docs1.length > 1500);
  t.true(traktService.renewShowReport.calledOnce);
});

test.serial('GET /api/v1/trakt/sync/movies', async t => {
  const { db: { MovieScrobble } } = t.context.app;

  const docs0 = await MovieScrobble.findAll();
  t.truthy(docs0.length === 0);

  await t.context.request.get('/api/v1/trakt/sync/movies');
  // rejection on schema mismatch

  const docs1 = await MovieScrobble.findAll();
  t.truthy(docs1.length > 200);
});

test.serial('GET /api/v1/trakt/shows/:imdb', async t => {
  const route = '/api/v1/trakt/shows/:imdb';
  const options = { params: { imdb: 'tt2193021' } };
  const fetch = () => t.context.request.get(route, options);

  const { body: { show: { syncedAt: syncedAt0 } } } = await fetch();
  // rejection on schema mismatch

  const { body: { show: { syncedAt: syncedAt1 } } } = await fetch();
  // rejection on schema mismatch
  t.truthy(syncedAt0 === syncedAt1);

  tk.travel(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)); // + 20 days

  const { body: { show: { syncedAt: syncedAt2 } } } = await fetch();
  // rejection on schema mismatch
  t.truthy(syncedAt0 !== syncedAt2);

  tk.reset();
});

test.serial('GET /api/v1/trakt/shows/tmdb/:tmdb', async t => {
  const route = '/api/v1/trakt/shows/tmdb/:tmdb';
  const options = { params: { tmdb: '1412' } };

  const { body: { show } } = await t.context.request.get(route, options);
  t.truthy(show.title === 'Arrow');
});

test.serial('GET /api/v1/trakt/movies/:imdb', async t => {
  const route = '/api/v1/trakt/movies/:imdb';
  const options = { params: { imdb: 'tt1392190' } };

  const { body: { movie } }  = await t.context.request.get(route, options);
  t.truthy(movie.title === 'Mad Max: Fury Road');
});

test.serial('GET /api/v1/trakt/movies/tmdb/:tmdb', async t => {
  const route = '/api/v1/trakt/movies/tmdb/:tmdb';
  const options = { params: { tmdb: '76341' } };

  const { body: { movie } }  = await t.context.request.get(route, options);
  t.truthy(movie.title === 'Mad Max: Fury Road');
});

test.serial('GET /api/v1/suggestions', async t => {
  const options = { query: { type: 'show', title: showTitle } };
  await t.context.request.get('/api/v1/suggestions', options);
  // rejection on schema mismatch
});

test.serial('GET /api/v1/dvdreleasesdates/suggestions', async t => {
  const options = { query: { query: 'captain america' } };
  const { body } = await t.context.request.get('/api/v1/dvdreleasesdates/suggestions', options);
  // rejection on schema mismatch

  t.truthy(body.suggestions[0].title === 'Captain America 3 Civil War (2016)');
});

test.serial('POST /api/v1/trakt/movies/release-date', async t => {
  const imdb = 'tt1392190';
  const route = '/api/v1/trakt/movies/:imdb';

  const fn0 = t.context.request.get(route, { params: { imdb } });
  const { body: { movie: { releaseDate: releaseDate0 } } } = await fn0;

  t.truthy(!releaseDate0);

  const query = {
    imdb,
    releaseDate: new Date().toISOString()
  };

  const fn1 = t.context.request.post('/api/v1/trakt/movies/release-date', { query });
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

  await t.context.request.post('/api/v1/trakt/movies/release-date', { query });

  const { body: { movies } } = await t.context.request.get('/api/v1/trakt/movies');
  // rejection on schema mismatch

  t.truthy(movies.length === 1);
  t.truthy(movies[0].imdb === imdb);
});

test.serial('Movie.releaseDateIndex complex', async t => {
  const fn = () => t.context.request.get('/api/v1/trakt/movies').then(({ body }) => body.movies.length);
  const imdb = 'tt1392190';

  await t.context.request.get('/api/v1/trakt/movies/:imdb', { params: { imdb } });
  t.truthy((await fn()) === 0);

  const query = {
    imdb,
    releaseDate: new Date().toISOString()
  };

  await t.context.request.post('/api/v1/trakt/movies/release-date', { query });
  t.truthy((await fn()) === 1);

  await t.context.request.get('/api/v1/trakt/sync/movies');
  t.truthy((await fn()) === 0);
});

test.serial('GET /api/v1/trakt/persons/tmdb/:tmdb', async t => {
  const { body: { person } } = await t.context.request.get('/api/v1/trakt/persons/tmdb/:tmdb', { params: { tmdb: 23659 } });
  t.truthy(person.name === 'Will Ferrell');
});

test.serial('GET /api/v1/trakt/persons/:imdb', async t => {
  const { body: { person } } = await t.context.request.get('/api/v1/trakt/persons/:imdb', { params: { imdb: 'nm0002071' } });
  t.truthy(person.name === 'Will Ferrell');
});

test.serial('PUT /api/v1/trakt/persons/:id', async t => {
  const { body: { person } } = await t.context.request.put('/api/v1/trakt/persons/:id', { params: { id: '23659' } });
  t.truthy(person.name === 'Will Ferrell');
});

test.serial('GET /api/v1/trakt/movies/recommendations', async t => {
  await t.context.request.get('/api/v1/trakt/sync/movies');

  await t.context.request.put('/api/v1/trakt/persons/:id', { params: { id: '23659' } });
  await t.context.request.put('/api/v1/trakt/persons/:id', { params: { id: '7399' } });

  await delay(1000);

  const res = await t.context.request.get('/api/v1/trakt/movies/recommendations');
  const { body: { movies } } = res;

  t.truthy(movies.length === 2);
  t.deepEqual(movies.map(_ => _.title), [
    'Megamind',
    'Anchorman: The Legend of Ron Burgundy'
  ]);
});

test.serial('POST /api/v1/trakt/movies/recommendations/rescan', async t => {
  await t.context.request.get('/api/v1/trakt/sync/movies');

  await t.context.request.put('/api/v1/trakt/persons/:id', { params: { id: '23659' } });
  await t.context.request.put('/api/v1/trakt/persons/:id', { params: { id: '7399' } });

  await delay(1000);

  const res0 = await t.context.request.get('/api/v1/trakt/movies/recommendations');
  const { body: { movies: movies0 } } = res0;

  t.truthy(movies0.length === 2);
  t.deepEqual(movies0.map(_ => _.title), [
    'Megamind',
    'Anchorman: The Legend of Ron Burgundy'
  ]);

  await t.context.request.post('/api/v1/trakt/movies/recommendations/rescan');
  const res1 = await t.context.request.get('/api/v1/trakt/movies/recommendations');

  const { body: { movies: movies1 } } = res1;
  t.deepEqual(movies0.map(_ => _.title), movies1.map(_ => _.title));
});

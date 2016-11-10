import test from 'ava';

import nockHook from 'nock-hook/ava';
import TmdbApi from '../';

test.beforeEach(async t => {
  t.context.closeNock = nockHook(t, __filename, { dirname: __dirname + '/fixtures/index' });
  t.context.api = new TmdbApi('d3350c6d641ee4f16f94a6c0b3b809d1');
});

test.afterEach(t => {
  t.context.closeNock();
});

test.serial('fetch a movie poster', async t => {
  const result = await t.context.api.getMovieByImdb('tt1392190');
  t.truthy(result.tagline === 'What a Lovely Day.');

  const posterUrl = await t.context.api.getMoviePosterByImdb('tt1392190');
  t.truthy(posterUrl === 'http://image.tmdb.org/t/p/w500//kqjL17yufvn9OVLyXYpvtyrFfak.jpg');
});

test.serial('fetch a show poster', async t => {
  const result = await t.context.api.getShowByImdb('tt0411008');
  t.truthy(result.first_air_date === '2004-09-22');

  const posterUrl = await t.context.api.getShowPosterByImdb('tt0411008');
  t.truthy(posterUrl === 'http://image.tmdb.org/t/p/w500//jyGspygDXJMydTOJj7iWNx9Elyd.jpg');
});

test.serial('fetch a person', async t => {
  const result = await t.context.api.getPersonByImdb('nm0002071');

  t.truthy(result.id === 23659);
  t.truthy(result.imdb_id === 'nm0002071');
  t.truthy(result.name === 'Will Ferrell');
});

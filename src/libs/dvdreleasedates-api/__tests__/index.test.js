import test from 'ava';
import * as api from '../';

test('search a movie', async t => {
  const movies = await api.search('captain america');
  t.truthy(movies.length === 4);

  const movie = movies[1];

  t.truthy(movie.title === 'Captain America 3 Civil War');
  t.truthy(movie.releaseDate === '2016-09-12T16:00:00.000Z');
});

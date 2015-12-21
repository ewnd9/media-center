import test from 'ava';
import 'babel-core/register';

import nockHelper from './utils/nock-helper';
const nock = nockHelper(__filename);

import * as trakt from './../src/trakt';

test.before(nock.beforeFn);
test.after(nock.afterFn);

test('trakt show search', async t => {
	const query = 'brooklyn nine nine';
	const type = 'show';

	const items = await trakt.search(query, type);

	t.is(items.length, 3);
	t.is(items[0].show.title, 'Brooklyn Nine-Nine');
	t.is(items[0].show.ids.imdb, 'tt2467372');
});

test('trakt movie search', async t => {
	const query = 'mission impossible';
	const type = 'movie';

	const items = await trakt.search(query, type);
	t.is(items.length, 10);
	t.is(items[9].movie.title, 'Mission: Impossible – Rogue Nation');
	t.is(items[9].movie.ids.imdb, 'tt2381249');
});

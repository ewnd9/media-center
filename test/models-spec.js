import test from 'ava';
import 'babel-core/register';
import createDb from './fixtures/create-db';

test('title', async t => {
  const db = await createDb();
  t.truthy(Object.keys(db).length === 3);
});

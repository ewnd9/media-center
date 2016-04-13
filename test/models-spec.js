import test from 'ava';
import 'babel-core/register';
import createDb from './fixtures/create-db';

test('title', t => {
  const db = createDb();
  t.truthy(Object.keys(db).length === 2);
});

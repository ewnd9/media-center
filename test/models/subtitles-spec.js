import test from 'ava';
import 'babel-core/register';

import createDb from '../fixtures/create-db';

test('Create correct subtitles model', async t => {
  const { Subtitles } = await createDb();

  const obj = {
    imdb: '123',
    lang: 'en',
    text: 'blablabla'
  };

  const result = await Subtitles.put(obj, obj);
  t.truthy(result._id);
});

test('Create incorrect subtitles model', async t => {
  const { Subtitles } = await createDb();

  const obj = {
    lang: 'en',
    text: 'blablabla'
  };

  try {
    await Subtitles.put(obj, obj);
  } catch (e) {
    t.truthy(e.length === 1);
    t.truthy(e[0].message === 'Invalid value undefined supplied to /imdb: String');
  }
});

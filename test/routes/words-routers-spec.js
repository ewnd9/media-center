import test from 'ava';

import createApp from '../fixtures/create-app';
import agent from '../fixtures/agent';

import { showImdb } from '../fixtures/create-fs';

test.beforeEach(async t => {
  t.context.app = await createApp();
  t.context.request = agent(t.context.app.server);
});

test.afterEach(async t => {
  t.context.app.server.close();
});

import {
  postWordRequestSchema,
  wordResponseSchema,
  wordsArrayResponseSchema,
  statusStringResponse
} from '../fixtures/api-schemas';

test('GET /api/v1/words', async t => {
  const wordDb = await persistWord(t);
  const { body } = await t.context.request.get(
    `/api/v1/words`,
    {},
    wordsArrayResponseSchema
  );

  t.truthy(body.words.length === 1);
  t.truthy(body.words[0]._id === wordDb._id);
  t.truthy(body.words[0].type === wordDb.type);
  t.truthy(body.words[0].word === wordDb.word);
});

test('POST /api/v1/words', async t => {
  const { word, example } = generateWord();
  const { body } = await t.context.request.post(
    '/api/v1/words',
    { word, example },
    postWordRequestSchema,
    wordResponseSchema
  );

  t.truthy(body.word.type === word.type);
  t.truthy(body.word.word === word.word);
  t.truthy(body.word.examples.length === 1);
  t.truthy(body.word.examples[0].text === example.text);
});

test('DELETE /api/v1/words/:id', async t => {
  const wordDb = await persistWord(t);
  const { body } = await t.context.request.delete(
    `/api/v1/words/${wordDb._id}`,
    {},
    statusStringResponse
  );

  const updatedWordDb = await t.context.app.db.Word.findById(wordDb._id);

  t.truthy(updatedWordDb._id === wordDb._id);
  t.truthy(updatedWordDb._rev !== wordDb._rev);
  t.truthy(updatedWordDb.isHidden !== wordDb.isHidden);
  t.truthy(updatedWordDb.isHidden === true);
});

async function persistWord(t) {
  const { word, example } = generateWord();
  return t.context.app.services.wordsService.addWord(word, example);
};

function generateWord() {
  const word = {
    type: 'noun',
    word: 'raven'
  };

  const example = {
    text: 'A raven came from the Citadel.',
    source: {
      imdb: showImdb,
      s: 1,
      ep: 1
    }
  };

  return { word, example };
}

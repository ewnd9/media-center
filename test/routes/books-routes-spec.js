import test from 'ava';

import { resolve } from 'path';

import agent, { validateResponse } from '../fixtures/agent';
import createApp from '../fixtures/create-app';

test.beforeEach(async t => {
  t.context.app = await createApp();
  t.context.request = agent(t.context.app.server);
});

test.afterEach(t => {
  t.context.app.server.close();
});

import {
  postBookSchema,
  bookResponseSchema,
  booksArrayResponseSchema
} from '../fixtures/api-schemas';

test('GET /api/v1/books', async t => {
  const response = await t.context.request.supertest.post('/api/v1/books')
    .attach('book.epub', resolve(__dirname, '..', 'fixtures', 'books', 'book.epub'));

  t.notThrows(async () => await validateResponse(postBookSchema, response));

  const { body: body1 } = await t.context.request.get(`/api/v1/books`, {}, booksArrayResponseSchema);
  // throws on schema mismatch
});

test('GET /api/v1/books/:id', async t => {
  const response = await t.context.request.supertest.post('/api/v1/books')
    .attach('book.epub', resolve(__dirname, '..', 'fixtures', 'books', 'book.epub'));

  t.notThrows(async () => await validateResponse(postBookSchema, response));
  const { body: { book } } = response;

  const { body: body1 } = await t.context.request.get(`/api/v1/books/${book._id}`, {}, bookResponseSchema);
  // throws on schema mismatch
});

test('POST /api/v1/books', async t => {
  const response = await t.context.request.supertest.post('/api/v1/books')
    .attach('book.epub', resolve(__dirname, '..', 'fixtures', 'books', 'book.epub'));

  t.notThrows(async () => await validateResponse(postBookSchema, response));
});

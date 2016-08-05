import t from 'tcomb-validation';

const TYPE_BOOK = 'book';
const TYPE_DICTIONARY = 'dictionary';

export const mediaExampleSourceSchema = t.struct({
  imdb: t.String,
  s: t.maybe(t.Number),
  ep: t.maybe(t.Number)
});

export const bookExampleSourceSchema = t.struct({
  type: t.enums.of([TYPE_BOOK]),
  author: t.String,
  title: t.String
});

export const dictionaryExampleSourceSchema = t.struct({
  type: t.enums.of([TYPE_DICTIONARY])
});

export const exampleSourceSchema = t.union([
  mediaExampleSourceSchema,
  bookExampleSourceSchema,
  dictionaryExampleSourceSchema
]);

exampleSourceSchema.dispatch = function(x) {
  if (x.imdb) {
    return mediaExampleSourceSchema;
  } else if (x.type === TYPE_BOOK) {
    return bookExampleSourceSchema;
  } else if (x.type === TYPE_DICTIONARY) {
    return dictionaryExampleSourceSchema;
  }
};

export const wordExampleSchema = t.struct({
  text: t.String,
  source: exampleSourceSchema,
  translation: t.maybe(t.String)
});

export const wordSchema = t.struct({
  _id: t.maybe(t.String),
  _rev: t.maybe(t.String),
  _key: t.maybe(t.String),

  type: t.String,
  word: t.String,
  isHidden: t.maybe(t.Boolean),
  examples: t.list(wordExampleSchema),

  lastFactor: t.maybe(t.Number),
  lastSchedule: t.maybe(t.Number),
  nextRepeat: t.maybe(t.Number),

  updatedAt: t.String
});

const Word = {
  createId: ({ type, word }) => `${type}:${word}`,
  schema: wordSchema,
  associate: () => {}
};

export default Word;

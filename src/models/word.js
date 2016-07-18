import t from 'tcomb-validation';

export const mediaExampleSourceSchema = t.struct({
  imdb: t.String,
  s: t.maybe(t.Number),
  ep: t.maybe(t.Number)
});

export const bookExampleSourceSchema = t.struct({
  type: t.enums.of(['book']),
  author: t.String,
  title: t.String
});

export const exampleSourceSchema = t.union([mediaExampleSourceSchema, bookExampleSourceSchema]);
exampleSourceSchema.dispatch = function(x) {
  return x.imdb ? mediaExampleSourceSchema : bookExampleSourceSchema;
};

export const wordExampleSchema = t.struct({
  text: t.String,
  source: exampleSourceSchema,
  translation: t.maybe(t.String)
});

export const wordSchema = t.struct({
  _id: t.maybe(t.String),
  _rev: t.maybe(t.String),
  type: t.String,
  word: t.String,
  isHidden: t.maybe(t.Boolean),
  examples: t.list(wordExampleSchema),
  updatedAt: t.String
});

const Word = {
  createId: ({ type, word }) => `${type}:${word}`,
  schema: wordSchema,
  associate: () => {}
};

export default Word;

import t from 'tcomb-validation';

export const wordExampleSchema = t.struct({
  text: t.String,
  source: t.struct({
    imdb: t.String,
    s: t.maybe(t.Number),
    ep: t.maybe(t.Number)
  }),
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

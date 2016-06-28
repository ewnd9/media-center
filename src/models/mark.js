import t from 'tcomb-validation';

const Mark = {
  createId: ({ imdb, s, ep }) => [imdb, s, ep].join(':'),
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    imdb: t.String,
    s: t.maybe(t.Number),
    ep: t.maybe(t.Number),
    title: t.String,
    type: t.String,
    marks: t.list(
      t.struct({
        position: t.Number,
        duration: t.Number,
        progress: t.Number,
        file: t.String
      })
    ),
    updatedAt: t.String
  }),
  indexes: {
    UPDATED_AT: {
      name: 'UPDATED_AT_1',
      /*eslint-disable */
      fn: (doc) => {
        emit(doc.updatedAt + '$' + doc._id);
      }
      /*eslint-enable */
    }
  },
  associate: () => {}
};

export default Mark;

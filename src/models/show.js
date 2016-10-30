import t from 'tcomb-validation';

export const imdbIndex = 'imdbIndex';

const Show = {
  createId: ({ tmdb }) => `show:${tmdb}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    _key: t.maybe(t.String),
    updatedAt: t.maybe(t.String),

    imdb: t.String,
    tmdb: t.Number,

    title: t.String,
    status: t.enums.of(['Ended', 'Returning Series']),
    tmdbData: t.Object
  }),
  indexes: [
    {
      name: imdbIndex,
      fn: `function(doc) {
        emit(doc.imdb);
      }`
    }
  ]
};

export const schema = Show.schema;
export default Show;

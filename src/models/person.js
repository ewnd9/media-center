import t from 'tcomb-validation';

export const imdbIndex = 'imdbIndex';

const Person = {
  createId: ({ tmdb }) => `person:${tmdb}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    _key: t.maybe(t.String),
    updatedAt: t.maybe(t.String),

    imdb: t.String,
    tmdb: t.Number,

    name: t.String,
    isFavorite: t.Boolean,

    tmdbData: t.Object,
    syncedAt: t.String
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

export const schema = Person.schema;
export default Person;

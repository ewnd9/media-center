import t from 'tcomb-validation';

export const imdbIndex = 'imdbIndex';
export const releaseDateIndex = 'releaseDateIndex';

const Movie = {
  createId: ({ tmdb }) => `movie:${tmdb}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    _key: t.maybe(t.String),
    updatedAt: t.maybe(t.String),

    imdb: t.String,
    tmdb: t.Number,

    title: t.String,
    tmdbData: t.Object,

    releaseDate: t.maybe(t.String),
    isWatched: t.maybe(t.Boolean),

    syncedAt: t.String
  }),
  indexes: [
    {
      name: imdbIndex,
      fn: `function(doc) {
        emit(doc.imdb);
      }`
    },
    {
      name: releaseDateIndex,
      fn: `function(doc) {
        if (doc.releaseDate && !doc.isWatched) {
          emit(doc.releaseDate);
        }
      }`
    }
  ]
};

export const schema = Movie.schema;
export default Movie;

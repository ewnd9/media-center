import t from 'tcomb-validation';

export const lastDateIndex = 'LAST_DATE_INDEX';

const EpisodeScrobble = {
  createId: ({ imdb, s, ep }) => `episode-scrobble:${imdb}:${s}:${ep}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    _key: t.maybe(t.String),
    updatedAt: t.maybe(t.String),

    imdb: t.String,
    tmdb: t.Number,
    s: t.Number,
    ep: t.Number,
    plays: t.Number,
    lastDate: t.String
  }),
  indexes: [
    {
      name: lastDateIndex,
      fn: `function(doc) {
        emit(doc.lastDate + '$' + doc._id);
      }`
    }
  ]
};

export const schema = EpisodeScrobble.schema;
export default EpisodeScrobble;

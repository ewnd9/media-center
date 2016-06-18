import t from 'tcomb-validation';

const Subtitles = {
  createId: ({ imdb, s, ep, lang = 'en' }) => `${imdb}:${s}:${ep}:${lang}`,
  schema: t.struct({
    _id: t.String,
    _rev: t.maybe(t.String),
    imdb: t.String,
    ep: t.maybe(t.Number), // not required
    s: t.maybe(t.Number),
    lang: t.String,
    text: t.String,
    updatedAt: t.String
  }),
  associate: () => {}
};

export default Subtitles;

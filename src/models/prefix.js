import t from 'tcomb-validation';

const Prefix = {
  createId: prefix => `prefix:${prefix}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    imdb: t.String,
    type: t.String,
    title: t.String,
    s: t.maybe(t.Number),
    ep: t.maybe(t.Number),
    updatedAt: t.String
  }),
  associate: models => {
    models.Prefix.getAll = files => models.Prefix.db.allDocs({
      include_docs: true,
      keys: files.map(file => models.Prefix.createId(file.recognition.title))
    });
  }
};

export default Prefix;

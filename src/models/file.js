import split from 'split-torrent-release';
import path from 'path';

import t from 'tcomb-validation';

const File = {
  createId: file => `file:${file.replace('\W', '')}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    _key: t.maybe(t.String),
    updatedAt: t.maybe(t.String),

    imdb: t.maybe(t.String),
    type: t.maybe(t.String),
    title: t.maybe(t.String),
    ep: t.maybe(t.Number),
    s: t.maybe(t.Number),
    position: t.maybe(t.Number),
    duration: t.maybe(t.Number),
    scrobble: t.maybe(t.Boolean),
    scrobbleAt: t.maybe(t.String),
    scrobbleAtDiff: t.maybe(t.String),
    hidden: t.maybe(t.Boolean)
  }),
  associate: models => {
    models.File.getAll = files => models.File.db.allDocs({
      include_docs: true,
      keys: files.map(file => models.File.createId(file))
    });

    models.File.add = (file, data) => {
      return models.File
        .update(file, data)
        .then(result => {
          const recognition = split(path.basename(file));

          if (recognition !== null) {
            return models.Prefix
              .update(recognition.title, data)
              .then(() => result);
          } else {
            return result;
          }
        });
    };
  }
};

export const schema = File.schema;
export default File;

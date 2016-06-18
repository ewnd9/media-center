import split from 'split-torrent-release';
import path from 'path';

import t from 'tcomb-validation';

const File = {
  createId: file => `file:${file.replace('\W', '')}`,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    imdb: t.String,
    type: t.String,
    title: t.String,
    ep: t.maybe(t.Number),
    s: t.maybe(t.Number),
    scrobble: t.maybe(t.Boolean),
    scrobbleAt: t.maybe(t.String),
    updatedAt: t.String
  }),
  associate: models => {
    models.File.getAll = files => models.File.db.allDocs({
      include_docs: true,
      keys: files.map(file => models.File.createId(file))
    });

    models.File.add = (file, data) => {
      const recognition = split(path.basename(file));

      return models.File
        .update(file, data)
        .then(() => models.Prefix.update(recognition.title, data));
    };
  }
};

export default File;

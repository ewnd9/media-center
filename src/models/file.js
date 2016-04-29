import split from 'split-torrent-release';
import path from 'path';

const createId = file => `file:${file.replace('\W', '')}`;

const associate = models => {
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
};

export default { createId, associate };

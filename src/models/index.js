import PouchDB from 'pouchdb';
import split from 'split-torrent-release';
import modelFactory from './model';

export default dbPath => {
  const db = new PouchDB(dbPath);
  const Model = modelFactory(db);

  const fileId = file => `file:${file.replace('\W', '')}`;
  const prefixId = prefix => `prefix:${prefix}`;

  const File = new Model(fileId);
  const Prefix = new Model(prefixId);

  File.getAll = files => db.allDocs({
    include_docs: true,
    keys: files.map(file => fileId(file))
  });

  File.add = (file, data) => {
    const parts = file.split('/');
    const filename = parts[parts.length - 1];

    const recognition = split(filename);

    return File
      .update(file, data)
      .then(() => Prefix.update(recognition.title, data));
  };

  Prefix.getAll = files => db.allDocs({
    include_docs: true,
    keys: files.map(file => prefixId(file.recognition.title))
  });

  return {
    File,
    Prefix
  };
};

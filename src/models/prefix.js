const createId = prefix => `prefix:${prefix}`;

const associate = models => {
  models.Prefix.getAll = files => models.Prefix.db.allDocs({
    include_docs: true,
    keys: files.map(file => models.Prefix.createId(file.recognition.title))
  });
};

export default { createId, associate };

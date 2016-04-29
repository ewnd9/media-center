import PouchDB from 'pouchdb';

export default (dbPath, name, createId) => {
  const db = new PouchDB(`${dbPath}-${name}`);
  return new Model(db, createId);
};

function Model(db, createId) {
  this.createId = createId;
  this.db = db;
}

Model.prototype.on404 = function(err, fn) {
  if (err.status === 404) {
    return fn();
  } else {
    throw err;
  }
};

Model.prototype.get = function(id) {
  return this.db.get(this.createId(id));
};

Model.prototype.put = function(id, data) {
  const doc = {
    ...data,
    _id: this.createId(id),
    updatedAt: new Date().toISOString()
  };

  return this.db.put(doc).then(() => doc);
};

Model.prototype.update = function(id, data) {
  return this
    .get(id)
    .then(
      dbData => this.put(id, { ...dbData, ...data }),
      err => this.on404(err, () => this.put(id, data))
    );
};

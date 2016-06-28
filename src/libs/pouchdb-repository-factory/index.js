export default Model;

function Model(db, createId, indexes, validate) {
  this.createId = createId;
  this.db = db;
  this.indexes = indexes || {};
  this.validate = validate;
}

Model.prototype.onNotFound = function(err, fn) {
  if (err.status === 404) {
    return fn();
  } else {
    throw err;
  }
};

Model.prototype.findById = function(id) {
  return this.db.get(id);
};

Model.prototype.findOne = function(id) {
  return this.db.get(this.createId(id));
};

Model.prototype.findOneOrInit = function(id, init) {
  return this
    .findOne(id)
    .then(null, err => this.onNotFound(err, init));
};

Model.prototype.findByIndex = function(index, options = {}) {
  return this.db
    .query(index, {
      include_docs: true,
      ...options
    })
    .then(res => res.rows.map(row => ({
      ...row.doc,
      _key: row.key
    })));
};

Model.prototype.findAll = function() {
  return this.db
    .allDocs({ include_docs: true });
};

Model.prototype.put = function(id, _data) {
  const data = _data || id;

  const doc = {
    ...data,
    _id: this.createId(id),
    updatedAt: new Date().toISOString()
  };

  return this
    .validate(doc)
    .then(doc => this.db.put(doc))
    .then(() => doc);
};

Model.prototype.update = function(id, _data) {
  const data = _data || id;
  data.updatedAt = new Date().toISOString();

  return this
    .findOne(id)
    .then(
      dbData => {
        const obj = { ...dbData, ...data };
        obj._rev = dbData._rev;

        return this
          .validate(obj)
          .then(obj => this.put(id, obj));
      },
      err => this.onNotFound(err, () => {
        return this
          .validate(data)
          .then(obj => this.put(id, obj));
      })
    );
};

Model.prototype.createDesignDoc = function(name, mapFunction) {
  const ddoc = {
    _id: '_design/' + name,
    views: {}
  };

  ddoc.views[name] = { map: mapFunction.toString() };
  return ddoc;
};

Model.prototype.ensureIndexes = function() {
  const promises = Object
    .keys(this.indexes)
    .map(key => {
      const { name, fn } = this.indexes[key];
      const designDoc = this.createDesignDoc(name, fn);

      return this.db
        .put(designDoc)
        .then(() => {
          console.log(`${designDoc._id} has been created`);
        }, err => {
          if (err.name === 'conflict') {
            console.log(`${designDoc._id} already exists`);
          } else {
            throw err;
          }
        });
    });

  return Promise.all(promises);
};

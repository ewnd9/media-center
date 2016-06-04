import Joi from 'joi';
export default Model;

function Model(db, createId, indexes, schema) {
  this.createId = createId;
  this.db = db;
  this.indexes = indexes || {};

  this.schema = schema ? Joi
    .object()
    .options({ abortEarly: false })
    .keys({
      ...schema,
      _id: Joi.string(),
      updatedAt: Joi.string()
    }) : null;
}

Model.prototype.validate = function(obj) {
  if (!this.schema) {
    return Promise.resolve(obj);
  }

  return new Promise((resolve, reject) => {
    Joi.validate(obj, this.schema, (err, result) => {
      if (err) {
        reject(err.details);
        return;
      }

      resolve(result);
    });
  });
};

Model.prototype.on404 = function(err, fn) {
  if (err.status === 404) {
    return fn();
  } else {
    throw err;
  }
};

Model.prototype.getById = function(id) {
  return this.db.get(id);
};

Model.prototype.get = function(id) {
  return this.db.get(this.createId(id));
};

Model.prototype.getOrInit = function(id, init) {
  return this.get(id).catch(err => {
    return this.on404(err, init);
  });
};

Model.prototype.put = function(id, data) {
  const doc = {
    ...data,
    _id: this.createId(id),
    updatedAt: new Date().toISOString()
  };

  return this.validate(doc)
    .then(doc => this.db.put(doc))
    .then(() => doc);
};

Model.prototype.update = function(id, data) {
  return this.validate(data)
    .then(data => {
      return this
        .get(id)
        .then(
          dbData => this.put(id, { ...dbData, ...data }),
          err => this.on404(err, () => this.put(id, data))
        );
    });
};

Model.prototype.findAll = function() {
  return this.db
    .allDocs({ include_docs: true });
};

Model.prototype.query = function(index, options) {
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

Model.prototype.createDesignDoc = function(name, mapFunction) {
  const ddoc = {
    _id: '_design/' + name,
    views: {}
  };

  ddoc.views[name] = { map: mapFunction.toString() };
  return ddoc;
};

Model.prototype.ensureIndexes = function() {
  const promises = Object.keys(this.indexes).map(key => {
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

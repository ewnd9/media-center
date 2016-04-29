export default db => {
  function Model(createId) {
    this.createId = createId;
  }

  Model.prototype.on404 = function(err, fn) {
    if (err.status === 404) {
      return fn();
    } else {
      throw err;
    }
  };

  Model.prototype.get = function(id) {
    return db.get(this.createId(id));
  };

  Model.prototype.put = function(id, data) {
    const doc = {
      ...data,
      _id: this.createId(id),
      updatedAt: new Date().toISOString()
    };

    return db.put(doc).then(() => doc);
  };

  Model.prototype.update = function(id, data) {
    return this
      .get(id)
      .then(
        dbData => this.put(id, { ...dbData, ...data }),
        err => this.on404(err, () => this.put(id, data))
      );
  };

  return Model;
};

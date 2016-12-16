export default () => {
  const data = {};
  const isProd = process.env.NODE_ENV === 'production';

  const cache = {
    get(key) { return isProd ? data[key] : undefined; },
    set(key, value) { data[key] = value; },
    del(key) { data[key] = undefined; }
  };

  const update = function update(key, promiseFn) {
    console.log(`cache update: ${key}`);

    return promiseFn().then(data => {
      cache.set(key, data);
      return data;
    });
  };

  const getOrInit = function getOrInit(key, promiseFn) {
    const data = cache.get(key);
    console.log(`cache get: ${key}, result: ${typeof data}`);

    if (data) {
      return Promise.resolve(data);
    } else {
      return update(key, promiseFn);
    }
  };

  const renew = function renew(key, promiseFn) {
    return update(key, promiseFn);
  };

  const expressResponse = function expressResponse(key, promiseFn) {
    return (req, res, next) => {
      return getOrInit(key, promiseFn)
        .then(result => res.json(result))
        .catch(err => next(err));
    };
  };

  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    del: cache.del.bind(cache),
    renew,
    getOrInit,
    expressResponse
  };
};

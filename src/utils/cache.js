import Cache from 'node-cache';

export default () => {
  const cache = new Cache({ stdTTL: 60 * 10 }); // invalidates in 10 mins

  const update = function update(key, promiseFn) {
    return promiseFn().then(data => {
      cache.set(key, data);
      return data;
    });
  };

  const getOrInit = function getOrInit(key, promiseFn) {
    const data = cache.get(key);

    if (data) {
      return Promise.resolve(data);
    } else {
      return update(key, promiseFn);
    }
  };

  const renew = function renew(key, promiseFn) {
    cache.del(key);
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

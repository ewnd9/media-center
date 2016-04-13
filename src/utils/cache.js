import Cache from 'node-cache';

export default () => {
  const cache = new Cache({ stdTTL: 60 * 10 }); // invalidates in 10 mins

  const getOrInit = function getOrInit(key, promiseFn) {
    const data = cache.get(key);

    if (data) {
      return Promise.resolve(data);
    } else {
      return promiseFn().then(data => {
        cache.set(key, data);
        return data;
      });
    }
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
    getOrInit,
    expressResponse
  };
};

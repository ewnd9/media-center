import express from 'express';

export default dbs => {
  const router = express.Router();

  router.use('/api/v1/db/:name', findDb(dbs));

  router.get('/api/v1/db/:name', (req, res, next) => {
    res.header('Content-Type', 'text/plain charset=utf-8');
    req.db.dump(res)
      .catch(err => next(err));
  });

  router.post('/api/v1/db/:name', (req, res, next) => {
    req.db.load(req)
      .then(result => {
        res.json({ status: result.ok === true ? 'ok' : 'error' });
      })
      .catch(err => next(err));
  });

  return router;
};

function findDb(dbs) {
  return (req, res, next) => {
    const { name } = req.params;
    const dbName = Object.keys(dbs).find(_ => _.toLowerCase() === name);

    if (!dbName) {
      res.status(404).json({ status: 'not-found' });
      return;
    }

    req.db = dbs[dbName].db;
    next();
  };
}

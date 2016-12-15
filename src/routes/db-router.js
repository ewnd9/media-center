import express from 'express';
import { pouchRoute } from 'pouchdb-express-router';

export default db => {
  const router = express.Router();

  Object.keys(db).forEach(dbName => {
    router.use(`/api/v1/db/${dbName}`, pouchRoute(db[dbName].db));
  });

  return router;
};

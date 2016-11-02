import fs from 'fs';
import pify from 'pify';

import t from 'tcomb';
import Router from '../libs/express-router-tcomb/';
import { paginationSchema } from './schema';

const readdir = pify(fs.readdir);

export default screenshotsPath => {
  const router = Router();

  router.get({
    path: '/api/v1/screenshots',
    schema: {
      query: paginationSchema,
      response: t.struct({ files: t.list(t.String) })
    },
    handler: (req, res, next) => {
      const { startIndex, limit } = req.pagination;

      readdir(screenshotsPath)
        .then(_files => {
          const files = _files.sort().reverse();

          res.json({
            files: files.slice(startIndex, startIndex + limit)
          });
        })
        .catch(err => next(err));
    }
  });

  return router.getRouter();
};

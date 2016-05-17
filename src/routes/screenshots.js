import express from 'express';

import fs from 'fs';
import pify from 'pify';

const readdir = pify(fs.readdir);

export default screenshotsPath => {
  const router = express.Router();

  router.get('/api/v1/screenshots', (req, res, next) => {
    const { startIndex, limit } = req.pagination;

    readdir(screenshotsPath)
      .then(_files => {
        const files = _files.sort().reverse();

        res.json({
          files: files.slice(startIndex, startIndex + limit)
        });
      })
      .catch(err => next(err));
  });

  return router;
};

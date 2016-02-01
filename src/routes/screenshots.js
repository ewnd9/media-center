import express from 'express';
import fs from 'fs';

export default (SCREENSHOTS_PATH) => {
  const router = express.Router();

  router.get('/api/v1/screenshots', (req, res) => {
    const files = fs.readdirSync(SCREENSHOTS_PATH);

  	res.json({
      files: files.sort().reverse()
    });
  });

  return router;
};

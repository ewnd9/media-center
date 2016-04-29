import express from 'express';
import execa from 'execa';

export default play => {
  const router = express.Router();

  router.post('/api/v1/youtube', (req, res, next) => {
    const query = req.body.query;

    // 18           mp4        640x360
    // 22           mp4        1280x720
    // https://github.com/rg3/youtube-dl/issues/1752

    return execa('youtube-dl', ['-f', '22', '-g', query])
      .then(({ stdout }) => {
        const url = stdout.split('\n')[0];
        return play(url);
      })
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  return router;
};

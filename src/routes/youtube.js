import express from 'express';
import execa from 'execa';

export default ({ playerService }) => {
  const router = express.Router();

  router.post('/api/v1/youtube', (req, res, next) => {
    const query = req.body.query;

    // 18           mp4        640x360
    // 22           mp4        1280x720
    // https://github.com/rg3/youtube-dl/issues/1752

    return execa('youtube-dl', ['-f', '22', '-g', query])
      .then(({ stdout }) => {
        const url = stdout.split('\n')[0];

        return playerService
          .play({ uri: url, traktScrobble: false });
      })
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  return router;
};

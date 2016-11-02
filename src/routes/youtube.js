import Router from '../libs/express-router-tcomb';

import t from 'tcomb';
import execa from 'execa';

import { statusStringResponse } from './schema';

export default ({ playerService }) => {
  const router = Router();

  router.post({
    path: '/api/v1/youtube',
    schema: {
      body: t.struct({ query: t.String }),
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      const { query } = req.body;

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
    }
  });

  return router.getRouter();
};

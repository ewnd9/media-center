import Router from 'express-router-tcomb';
import { torrentMagnet, torrentFilePath, statusStringResponse } from './schema';

export default ({ torrentsService }) => {
  const router = Router();

  router.post({
    path: '/api/v1/torrents',
    schema: {
      body: torrentMagnet,
      response: statusStringResponse
    },
    handler: (req, res) => {
      torrentsService.addTorrent(req.body.magnet);
      res.json({ status: 'ok' });
    }
  });

  router.post({
    path: '/api/v1/torrents/server',
    schema: {
      body: torrentFilePath,
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      torrentsService
        .playTorrent(req.body.path)
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  return router.getRoutes();
};

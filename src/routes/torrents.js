import Router from 'express-router-tcomb';
import { torrentMagnet, statusStringResponse } from './schema';

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

  return router.getRoutes();
};

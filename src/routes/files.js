import Router from 'express-router-tcomb';

import {
  filesArrayResponseSchema,
  fileScrobbleRequestSchema,
  statusStringResponse,
  filePositionRequestSchema,
  fileResponseSchema,
  fileHiddenRequestSchema,
  playbackStartRequestSchema,
  playbackInfoResponseSchema
} from './schema';

export default ({ filesService, playerService }) => {
  const router = Router();

  router.get({
    path: '/api/v1/files',
    schema: {
      response: filesArrayResponseSchema
    },
    handler: (req, res, next) => {
      filesService
        .findFilesWithStreamUrls(req.headers.host)
        .then(_ => res.json(_))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/playback/status',
    schema: {
      response: playbackInfoResponseSchema
    },
    handler: (req, res) => {
      res.json(playerService.getInfo());
    }
  });

  router.post({
    path: '/api/v1/playback/start',
    schema: {
      body: playbackStartRequestSchema,
      response: statusStringResponse
    },
    handler: (req, res) => {
      const noScrobble = req.body.noScrobble;

      if (!noScrobble) {
        filesService
          .addFile(req.body.filename, req.body.media);
      }

      playerService
        .play({ media: req.body.media, uri: req.body.filename, position: req.body.position, traktScrobble: !noScrobble });

      res.json({ status: 'ok' });
    }
  });

  router.post({
    path: '/api/v1/playback/info',
    schema: {
      body: fileScrobbleRequestSchema,
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      filesService
        .addFile(req.body.filename, req.body.media)
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  router.post({
    path: '/api/v1/files/scrobble',
    schema: {
      body: fileScrobbleRequestSchema,
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      playerService
        .addToHistory(req.body.filename, req.body.media)
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  router.post({
    path: '/api/v1/files/hidden',
    schema: {
      body: fileHiddenRequestSchema,
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      filesService
        .updateFile(req.body.file, {
          hidden: true,
          title: req.body.filename
        })
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  router.post({
    path: '/api/v1/files/position',
    schema: {
      body: filePositionRequestSchema,
      response: fileResponseSchema
    },
    handler: (req, res, next) => {
      const {
        filename,
        media,
        position,
        duration
      } = req.body;

      filesService
        .updatePosition(filename, media, position, duration)
        .then(file => res.json({ file }))
        .catch(err => next(err));
    }
  });

  router.delete({
    path: '/api/v1/files/:filename',
    schema: {
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      const { filename } = req.params;

      filesService
        .deleteFile(filename)
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  return router.getRoutes();
};

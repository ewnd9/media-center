import express from 'express';

export default ({ filesService, playerService }) => {
  const router = express.Router();

  router.get('/api/v1/files', (req, res, next) => {
    filesService
      .findAllFiles()
      .then(_ => res.json(_))
      .catch(err => next(err));
  });

  router.post('/api/v1/files/existence', (req, res, next) => {
    const query = req.body.query.reduce((total, curr) => {
      total[curr] = false;
      return total;
    }, {});

    filesService
      .findAllFiles()
      .then(folders => {
        folders.forEach(folder => {
          folder.media.forEach(media => {
            if (typeof query[media.file] !== 'undefined') {
              query[media.file] = true;
            }
          });
        });

        res.json(query);
      })
      .catch(err => next(err));
  });

  router.get('/api/v1/playback/status', (req, res) => {
    res.json(playerService.getInfo());
  });

  router.post('/api/v1/playback/start', (req, res) => {
    const noScrobble = req.body.noScrobble;

    if (!noScrobble) {
      filesService
        .addFile(req.body.filename, req.body.media);
    }

    playerService
      .play({ media: req.body.media, uri: req.body.filename, position: req.body.position, traktScrobble: !noScrobble });

    res.json({ status: 'ok' });
  });

  router.post('/api/v1/playback/info', (req, res, next) => {
    filesService
      .addFile(req.body.filename, req.body.media)
      .then(() => res.json({ status: 'ok '}))
      .catch(err => next(err));
  });

  router.post('/api/v1/files/scrobble', (req, res, next) => {
    playerService
      .addToHistory(req.body.filename, req.body.media)
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  router.post('/api/v1/files/hidden', (req, res, next) => {
    filesService
      .updateFile(req.body.file, {
        hidden: true,
        title: req.body.filename
      })
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  return router;
};

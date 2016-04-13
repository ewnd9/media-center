import express from 'express';
import findFiles from './../find-files';

import Cache from '../utils/cache';
const REPORT_CACHE = 'REPORT_CACHE';

export default (MEDIA_PATH, db, trakt, play) => {
  const router = express.Router();
  const cache = new Cache();

  let player;

  const addToHistory = (filename, media) => {
    return trakt
      .addToHistory(media)
      .then(() => db.File.update(filename, {
        scrobble: true,
        scrobbleAt: new Date().toISOString()
      }));
  };

  router.get('/api/v1/files', (req, res, next) => {
    findFiles(db, MEDIA_PATH)
      .then(_ => res.json(_))
      .catch(err => next(err));
  });

  router.post('/api/v1/files/existence', (req, res, next) => {
    const query = req.body.query.reduce((total, curr) => {
      total[curr] = false;
      return total;
    }, {});

    findFiles(db, MEDIA_PATH)
      .then(folders => {
        folders.forEach(folder => {
          folder.media.forEach(media => {
            if (typeof query[media.file] !== 'undefined') {
              query[media.file] = true;
            }
          })
        });

        res.json(query);
      })
      .catch(err => next(err));
  });

  router.get('/api/v1/playback/status', (req, res) => {
    if (player) {
      res.json(player.getInfo());
    } else {
      res.json({ status: null });
    }
  });

  router.post('/api/v1/playback/start', (req, res) => {
    db.File.add(req.body.filename, req.body.media);

    play(trakt, addToHistory, db, req.body.media, req.body.filename, req.body.position)
      .then(_player => player = _player);

    res.json({ status: 'ok' });
  });

  router.post('/api/v1/playback/info', (req, res, next) => {
    db.File.add(req.body.filename, req.body.media)
      .then(() => res.json({ status: 'ok '}))
      .catch(err => next(err));
  });

  router.post('/api/v1/files/scrobble', (req, res, next) => {
    addToHistory(req.body.filename, req.body.media)
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  router.post('/api/v1/files/hidden', (req, res, next) => {
    db.File
      .update(req.body.file, {
        hidden: true,
        title: req.body.filename
      })
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  const formatSuggestion = (media) => {
    return {
      value: media.ids.imdb,
      label: `${media.title} (${media.year})`
    };
  };

  router.get('/api/v1/suggestions', (req, res) => {
    trakt
      .search(req.query.title, req.query.type)
      .then((data) => {
        res.json(data.map(media => formatSuggestion(media[req.query.type])));
      })
      .catch(() => res.json([]));
  });

  router.get('/api/v1/report', cache.expressResponse(REPORT_CACHE, trakt.getReport.bind(trakt)));

  return router;
};

import express from 'express';
import findFiles from './../find-files';

export default (MEDIA_PATH, db, trakt, play) => {
  const router = express.Router();
  let player;

  const addToHistory = (filename, media) => {
  	return trakt
  		.addToHistory(media)
  		.then(() => db.updateFile(filename, {
  			scrobble: true,
  			scrobbleAt: new Date().toISOString()
  		}));
  };

  router.get('/api/v1/files', (req, res, next) => {
  	findFiles(db, MEDIA_PATH)
  		.then(_ => res.json(_))
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
  	db.addFile(req.body.filename, req.body.media);

  	if (process.env.NODE_ENV === 'production') {
  		play(trakt, addToHistory, db, req.body.media, req.body.filename, req.body.position)
  			.then(_player => player = _player);
  	} else {
  		console.log(process.env.NODE_ENV);
  	}

  	res.json({ status: 'ok' });
  });

  router.post('/api/v1/playback/info', (req, res, next) => {
  	db.addFile(req.body.filename, req.body.media)
  		.then(() => res.json({ status: 'ok '}))
  		.catch(err => next(err));
  });

  router.post('/api/v1/history', (req, res, next) => {
  	addToHistory(req.body.filename, req.body.media)
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

  let reportCache;

  router.get('/api/v1/report', (req, res, next) => {
    if (reportCache) {
      res.json(reportCache);
    } else {
      trakt
        .getReport()
        .then(_ => {
          reportCache = _;
          res.json(_);
        })
        .catch(err => next(err));
    }
  });

  return router;
};

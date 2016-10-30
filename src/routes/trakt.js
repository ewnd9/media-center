import express from 'express';

const formatSuggestion = media => {
  return {
    value: media.ids.imdb,
    label: `${media.title} (${media.year})`
  };
};

export default ({ traktService }) => {
  const router = express.Router();

  router.get('/api/v1/suggestions', (req, res) => {
    traktService
      .search(req.query.title, req.query.type)
      .then(data => {
        res.json(data.map(media => formatSuggestion(media[req.query.type])));
      })
      .catch(() => res.json([])); // why
  });

  router.get('/api/v1/trakt/report', (req, res, next) => {
    traktService
      .getShowReportWithPosterUrls(req.headers.host)
      .then(report => res.json({ report }))
      .catch(err => next(err));
  });

  router.get('/api/v1/trakt/sync/shows', (req, res, next) => {
    traktService
      .syncShowsHistory()
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  router.get('/api/v1/trakt/shows/:imdb', (req, res, next) => {
    traktService
      .findShowByImdb(req.params.imdb)
      .then(show => res.json({ show }))
      .catch(err => next(err));
  });

  return router;
};

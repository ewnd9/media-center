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

  router.get('/api/v1/report', (req, res, next) => {
    traktService
      .getReportWithPosterUrls(req.headers.host)
      .then(data => res.json(data))
      .catch(err => next(err));
  });

  return router;
};

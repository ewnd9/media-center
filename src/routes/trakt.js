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

  router.get('/api/v1/dvdreleasesdates/suggestions', (req, res, next) => {
    traktService
      .searchDvdReleases(req.query.query)
      .then(suggestions => res.json({ suggestions }))
      .catch(err => next(err));
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

  router.get('/api/v1/trakt/sync/movies', (req, res, next) => {
    traktService
      .syncMoviesHistory()
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  router.get('/api/v1/trakt/shows/:imdb', (req, res, next) => {
    traktService
      .findShowByImdb(req.params.imdb, req.headers.host)
      .then(show => res.json({ show }))
      .catch(err => next(err));
  });

  router.get('/api/v1/trakt/movies/:imdb', (req, res, next) => {
    traktService
      .findMovieByImdb(req.params.imdb, req.headers.host)
      .then(movie => res.json({ movie }))
      .catch(err => next(err));
  });

  router.get('/api/v1/trakt/movies', (req, res, next) => {
    traktService
      .findMoviesByReleaseDate(req.headers.host)
      .then(movies => res.json({ movies }))
      .catch(err => next(err));
  });

  router.post('/api/v1/trakt/movies/release-date', (req, res, next) => {
    traktService
      .updateMovieByReleaseDate(req.query.imdb, req.query.releaseDate, req.headers.host)
      .then(movie => res.json({ movie }))
      .catch(err => next(err));
  });

  return router;
};

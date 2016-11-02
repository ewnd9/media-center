import Router from '../libs/express-router-tcomb';
import t from 'tcomb';

const formatSuggestion = media => {
  return {
    value: media.ids.imdb,
    label: `${media.title} (${media.year})`
  };
};

import {
  traktReportResponseSchema,
  statusStringResponse,

  traktSuggestionsResponseSchema,
  dvdReleasesSuggestionsResponseSchema,

  traktShowResponseSchema,
  traktMovieResponseSchema,
  traktMoviesResponseSchema
} from './schema';

export default ({ traktService }) => {
  const router = Router();

  router.get({
    path: '/api/v1/suggestions',
    schema: {
      query: t.struct({
        type: t.enums.of(['show', 'movie']),
        title: t.String
      }),
      response: traktSuggestionsResponseSchema
    },
    handler: (req, res) => {
      traktService
        .search(req.query.title, req.query.type)
        .then(data => {
          res.json(data.map(media => formatSuggestion(media[req.query.type])));
        })
        .catch(() => res.json([])); // why
    }
  });

  router.get({
    path: '/api/v1/dvdreleasesdates/suggestions',
    schema: {
      query: t.struct({
        query: t.String
      }),
      response: dvdReleasesSuggestionsResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .searchDvdReleases(req.query.query)
        .then(suggestions => res.json({ suggestions }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/report',
    schema: {
      response: traktReportResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .getShowReportWithPosterUrls(req.headers.host)
        .then(report => res.json({ report }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/sync/shows',
    schema: {
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      traktService
        .syncShowsHistory()
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/sync/movies',
    schema: {
      response: statusStringResponse
    },
    handler: (req, res, next) => {
      traktService
        .syncMoviesHistory()
        .then(() => res.json({ status: 'ok' }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/shows/:imdb',
    schema: {
      response: traktShowResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .findShowByImdb(req.params.imdb, req.headers.host)
        .then(show => res.json({ show }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/movies/:imdb',
    schema: {
      response: traktMovieResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .findMovieByImdb(req.params.imdb, req.headers.host)
        .then(movie => res.json({ movie }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/movies',
    schema: {
      response: traktMoviesResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .findMoviesByReleaseDate(req.headers.host)
        .then(movies => res.json({ movies }))
        .catch(err => next(err));
    }
  });

  router.post({
    path: '/api/v1/trakt/movies/release-date',
    schema: {
      query: t.struct({
        imdb: t.String,
        releaseDate: t.String
      }),
      response: traktMovieResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .updateMovieByReleaseDate(req.query.imdb, req.query.releaseDate, req.headers.host)
        .then(movie => res.json({ movie }))
        .catch(err => next(err));
    }
  });

  return router.getRouter();
};

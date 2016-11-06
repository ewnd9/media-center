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
  traktMoviesResponseSchema,
  traktPersonResponse
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
    path: '/api/v1/trakt/shows/tmdb/:tmdb',
    schema: {
      response: traktShowResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .findShow(req.params.tmdb, req.headers.host)
        .then(show => res.json({ show }))
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

  router.get({
    path: '/api/v1/trakt/movies/recommendations',
    schema: {
      response: traktMoviesResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .findMoviesRecommendations(req.headers.host)
        .then(movies => res.json({ movies }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/movies/tmdb/:tmdb',
    schema: {
      response: traktMovieResponseSchema
    },
    handler: (req, res, next) => {
      traktService
        .findMovie(req.params.tmdb, req.headers.host)
        .then(movie => res.json({ movie }))
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

  router.get({
    path: '/api/v1/trakt/persons/tmdb/:tmdb',
    schema: {
      response: traktPersonResponse
    },
    handler: (req, res, next) => {
      traktService
        .findPerson(req.params.tmdb)
        .then(person => res.json({ person }))
        .catch(err => next(err));
    }
  });

  router.get({
    path: '/api/v1/trakt/persons/:imdb',
    schema: {
      response: traktPersonResponse
    },
    handler: (req, res, next) => {
      traktService
        .findPersonByImdb(req.params.imdb)
        .then(person => res.json({ person }))
        .catch(err => next(err));
    }
  });

  router.put({
    path: '/api/v1/trakt/persons/:id',
    schema: {
      response: traktPersonResponse
    },
    handler: (req, res, next) => {
      traktService
        .addPerson(req.params.id)
        .then(person => res.json({ person }))
        .catch(err => next(err));
    }
  });

  return router.getRouter();
};

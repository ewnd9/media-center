import Router from 'express-router-tcomb';
import t from 'tcomb';
import Cache from '../utils/cache';

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

import getPosterUrl from '../utils/poster-url';

export default ({ traktService, personsService, tmdbService, recommendationsService }) => {
  const router = Router();
  const cache = new Cache();

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
        .getShowReport()
        .then(report => replaceItemsPosterUrl(report, 'show', req.headers.host))
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
      tmdbService
        .findShow(req.params.tmdb)
        .then(show => replaceOneItemPosterUrl(show, 'show', req.headers.host))
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
      tmdbService
        .findShowByImdb(req.params.imdb)
        .then(show => replaceOneItemPosterUrl(show, 'show', req.headers.host))
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
        .findMoviesByReleaseDate()
        .then(movies => replaceItemsPosterUrl(movies, 'movie', req.headers.host))
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
      recommendationsService
        .findMoviesRecommendations()
        .then(movies => replaceItemsPosterUrl(movies, 'movie', req.headers.host))
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
      tmdbService
        .findMovie(req.params.tmdb)
        .then(movie => replaceOneItemPosterUrl(movie, 'movie', req.headers.host))
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
      tmdbService
        .findMovieByImdb(req.params.imdb)
        .then(movie => replaceOneItemPosterUrl(movie, 'movie', req.headers.host))
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
        .updateMovieByReleaseDate(req.query.imdb, req.query.releaseDate)
        .then(movie => replaceOneItemPosterUrl(movie, 'movie', req.headers.host))
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
      const { tmdb } = req.params;
      const cacheKey = getPersonCacheKey({ tmdb });

      cache
        .getOrInit(cacheKey, () => personsService.findPerson({ tmdb }))
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
      const { imdb } = req.params;
      const cacheKey = getPersonCacheKey({ imdb });

      cache
        .getOrInit(cacheKey, () => personsService.findPerson({ imdb }))
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
      const { id } = req.params;
      const cacheKey = getPersonCacheKey({ tmdb: id });

      personsService
        .addPerson(id)
        .then(person => {
          cache.set(cacheKey, person);
          return person;
        })
        .then(person => res.json({ person }))
        .catch(err => next(err));
    }
  });

  return router.getRoutes();
};

function replaceItemsPosterUrl(items, type, host) {
  return items.map(item => replaceOneItemPosterUrl(item, type, host));
}

function replaceOneItemPosterUrl(item, type, host) {
  item.posterUrl = getPosterUrl(type, item.imdb, undefined, host);
  return item;
}

function formatSuggestion(media) {
  return {
    value: media.ids.imdb,
    label: `${media.title} (${media.year})`
  };
}

function getPersonCacheKey({ imdb, tmdb }) {
  return imdb ? `imdb:${imdb}` : `tmdb:${tmdb}`;
}

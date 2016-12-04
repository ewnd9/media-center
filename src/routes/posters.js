import express from 'express';

export default ({ postersService }) => {
  const router = express.Router();

  router.get('/api/v1/posters/:type/:imdb/:season*?', (req, res, next) => {
    // const { type, imdb, season } = req.params; // need fix to trakt-utils for season support
    const { type, imdb } = req.params;

    postersService
      .getPosterStream(type, imdb)
      .then(stream => {
        res.set('Cache-Control', 'max-age=31536000'); // 1 year
        stream.pipe(res);
      })
      .catch(err => next(err));
  });

  router.get('/api/v1/posters/placeholder.jpg', (req, res, next) => {
    postersService
      .getPlaceholderPosterStream()
      .then(stream => {
        res.set('Cache-Control', 'max-age=31536000'); // 1 year
        stream.pipe(res);
      })
      .catch(err => next(err));
  });

  return router;
};

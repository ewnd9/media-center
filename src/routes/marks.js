import express from 'express';

export default ({ marksService }) => {
  const router = express.Router();

  router.get('/api/v1/marks', (req, res, next) => {
    const { limit, since } = req.pagination;

    marksService
      .findAll(limit, since)
      .then(data => res.json(data))
      .catch(err => next(err));
  });

  router.get('/api/v1/marks/:id', (req, res, next) => {
    marksService
      .findOne(req.params.id)
      .then(data => res.json(data))
      .catch(err => next(err));
  });

  return router;
};

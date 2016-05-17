import express from 'express';

export default ({ marksService }) => {
  const router = express.Router();

  router.get('/api/v1/marks', (req, res, next) => {
    marksService
      .findAll()
      .then(data => res.json(data))
      .catch(err => next(err));
  });

  return router;
};

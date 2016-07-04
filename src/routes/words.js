import express from 'express';

export default ({ wordsService }) => {
  const router = express.Router();

  router.get('/api/v1/words', (req, res, next) => {
    const { limit, since } = req.pagination;

    wordsService
      .findAll(limit, since)
      .then(words => res.json({ words }))
      .catch(err => next(err));
  });

  router.post('/api/v1/words', (req, res, next) => {
    const { word, example } = req.body;

    wordsService
      .addWord(word, example)
      .then(word => res.json({ word }))
      .catch(err => next(err));
  });

  router.delete('/api/v1/words/:id', (req, res, next) => {
    const { id } = req.params;

    wordsService
      .removeWord(id)
      .then(() => res.json({ status: 'ok' }))
      .catch(err => next(err));
  });

  return router;
};

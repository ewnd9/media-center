import express from 'express';
import Busboy from 'busboy';

export default ({ booksService }) => {
  const router = express.Router();

  router.get('/api/v1/books', (req, res, next) => {
    const { limit, since } = req.pagination;

    return booksService
      .findAll(limit, since)
      .then(books => res.json({ books }))
      .catch(err => next(err));
  });

  router.get('/api/v1/books/:id', (req, res, next) => {
    return booksService
      .findById(req.params.id)
      .then(book => res.json({ book }))
      .catch(err => next(err));
  });

  router.post('/api/v1/books', (req, res, next) => {
    const busboy = new Busboy({ headers: req.headers });

    let filename;

    busboy.on('file', function(fieldname, file, _filename) {
      filename = _filename;
      file.pipe(booksService.getWriteStream(filename));
    });

    busboy.on('finish', function() {
      booksService
        .saveBook(filename, filename)
        .then(book => res.json({ book }))
        .catch(err => next(err));
    });

    res.on('close', function() {
      req.unpipe(busboy);
    });

    req.pipe(busboy);
  });

  return router;
};

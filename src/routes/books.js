import express from 'express';
import Busboy from 'busboy';

export default ({ booksService }) => {
  const router = express.Router();

  router.post('/api/v1/books', (req, res, next) => {
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename) {
      file.pipe(booksService.getWriteStream(filename));
    });

    busboy.on('finish', function() {
      res.json({ status: 'ok' });
    });

    res.on('close', function() {
      req.unpipe(busboy);
    });

    req.pipe(busboy);
  });

  return router;
}

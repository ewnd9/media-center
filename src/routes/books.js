import express from 'express';

export default ({ booksService }) => {
  const router = express.Router();

  router.post('/api/v1/books', (req, res, next) => {
    if (req.busboy) {
      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        file.pipe(booksService.getWriteStream(filename));
      });

      req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
      });

      req.busboy.on('finish', () => {
        res.json({ status: 'ok' });
      })

      req.pipe(req.busboy);
    } else {
      res.json({ status: 'error' });
    }
  });

  return router;
}

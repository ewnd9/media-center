import express from 'express';
import Promise from 'bluebird';
import bodyParser from 'body-parser';

export default (port, routes) => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));

  app.use('/', routes);

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
};

import path from 'path';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import compression from 'compression';
import socketIO from 'socket.io';
import Bus from './bus';

import PaginationMiddleware from './routes/middleware/pagination';

import FilesRouter from './routes/files';
import ScreenshotsRouter from './routes/screenshots';
import YoutubeRouter from './routes/youtube';
import TraktRouter from './routes/trakt';
import PostersRouter from './routes/posters';

import report from './agent';

function createServer({ db, services, config }) {
  const { screenshotPath, port } = config;
  const app = express();

  app.use(morgan('request: :remote-addr :method :url :status'));
  app.use(cors());

  app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));

  app.use(compression());

  app.use('/screenshots', express.static(screenshotPath));
  app.use('/', PaginationMiddleware);

  app.use('/', FilesRouter(services));
  app.use('/', YoutubeRouter(services));
  app.use('/', ScreenshotsRouter(screenshotPath));
  app.use('/', TraktRouter(services));
  app.use('/', PostersRouter(services));

  const httpServer = http.createServer(app);
  const io = socketIO(httpServer);

  if (process.env.NODE_ENV !== 'development') {
    app.use(express.static('public'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
    });
  } else {
    const webpack = require('webpack');
    const webpackMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    const wconfig = require('../webpack.config');
    wconfig.entry.app = [
      'webpack-hot-middleware/client?reload=true',
      wconfig.entry.app
    ];

    const compiler = webpack(wconfig);
    const middleware = webpackMiddleware(compiler, {
      ...wconfig.devServer,
      contentBase: __dirname
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));

    app.get('*', (req, res, next) => {
      const filename = path.join(compiler.outputPath, 'index.html');

      compiler.outputFileSystem.readFile(filename, (err, result) => {
        if (err) {
          return next(err);
        }

        res.set('content-type','text/html');
        res.end(result);
      });
    });
  }

  app.use((err, req, res, next) => {
    if (!err) {
      next();
      return;
    }

    console.log(err, err.stack);
    report(err, { url: req.url });

    res.status(500);
    res.json({ error: err.stack && err.stack.split('\n') || err });
  });

  const bus = new Bus(services, io);
  const server = httpServer.listen(port, () => console.log(`listen localhost:${server.address().port}`));

  if (process.env.NODE_ENV === 'production') {
    Object
      .keys(services)
      .forEach(key => {
        const service = services[key];

        if (service.prefetch) {
          service.prefetch();
        }
      });
  }

  return { server, app, bus, db, services, config };
}

export default createServer;

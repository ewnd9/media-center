import path from 'path';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import HTTP from 'http';
import socketIO from 'socket.io';
import Bus from './bus';

import PaginationMiddleware from './routes/middleware/pagination';

import FilesRouter from './routes/files';
import ScreenshotsRouter from './routes/screenshots';
import YoutubeRouter from './routes/youtube';
import TraktRouter from './routes/trakt';
import MarksRouter from './routes/marks';
import PostersRouter from './routes/posters';

function createServer({ db, services, screenshotPath, port }) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));

  app.use(morgan('request: :remote-addr :method :url :status'));
  app.use(express.static('public'));
  app.use('/screenshots', express.static(screenshotPath));
  app.use(cors());

  app.use('/', PaginationMiddleware);

  app.use('/', FilesRouter(services));
  app.use('/', YoutubeRouter(services));
  app.use('/', ScreenshotsRouter(screenshotPath));
  app.use('/', TraktRouter(services));
  app.use('/', MarksRouter(services));
  app.use('/', PostersRouter(services));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
  });

  app.use((err, req, res, next) => {
    if (!err) {
      next();
      return;
    }

    console.log(err, err.stack);

    res.status(500);
    res.json({ error: err.stack.split('\n') });
  });

  const http = HTTP.Server(app);
  const io = socketIO(http);

  const bus = new Bus(services, io);
  const server = http.listen(port, () => console.log(`listen localhost:${server.address().port}`));

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

  return { server, bus, db, services };
}

export default createServer;

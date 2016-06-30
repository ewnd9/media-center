import proxyquire from 'proxyquire';
import mkdirp from 'mkdirp';
import { generateTmpDir } from './create-db';
import createTraktService from './create-trakt-service';

const defaultTrackMock = {
  getReport: () => {},
  search: () => {},
  addToHistory: () => {}
};

export default ({ traktMock = defaultTrackMock, playerServiceMock } = {}) => {
  const tmpDir = generateTmpDir();
  mkdirp.sync(tmpDir);

  const servicesMocks = {
    './trakt-service': {
      default: createTraktService
    }
  };

  if (playerServiceMock) {
    servicesMocks['./player-service'] = playerServiceMock;
  }

  const createApp = proxyquire('../../src/index', {
    './config': {
      dbPath: tmpDir,
      mediaPath: tmpDir,
      screenshotPath: tmpDir,
      trakt: traktMock,
      port: undefined
    },
    './services/index': proxyquire('../../src/services/index', servicesMocks),
    './server': proxyquire('../../src/server', {
      './routes/youtube': proxyquire('../../src/routes/youtube', {
        execa: () => Promise.resolve({ stdout: 'youtube-url' })
      })
    })
  }).default;

  const app = createApp();

  return createApp()
    .then(app => {
      app.services.marksService._fetchSubtitlesFromApi = function() {
        return Promise.resolve('subtitles'); // i never need to test subtitles, so global overriding
      };

      return app;
    });
};

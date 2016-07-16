import proxyquire from 'proxyquire';
import mkdirp from 'mkdirp';
import { generateTmpDir } from './create-db';
import createTraktService from './create-trakt-service';

const defaultTrackMock = {
  getReport: () => {},
  search: () => {},
  addToHistory: () => {}
};

export default ({ traktMock = defaultTrackMock, playerServiceMock, marksServiceMock } = {}) => {
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

  if (marksServiceMock) {
    servicesMocks['./marks-service'] = marksServiceMock;
  }

  const createApp = proxyquire('../../src/index', {
    './config': {
      dbPath: tmpDir,
      mediaPath: tmpDir,
      screenshotPath: tmpDir,
      trakt: traktMock,
      port: (Math.random() * 64514) | 0 + 1024
    },
    './services/index': proxyquire('../../src/services/index', servicesMocks),
    './server': proxyquire('../../src/server', {
      './routes/youtube': proxyquire('../../src/routes/youtube', {
        execa: () => Promise.resolve({ stdout: 'youtube-url' })
      })
    })
  }).default;

  return createApp();
};

import proxyquire from 'proxyquire';
import { generateTmpDir } from './create-db';
import mkdirp from 'mkdirp';

const defaultTrackMock = {
  getReport: () => {},
  search: () => {},
  addToHistory: () => {}
};

export default ({ traktMock = defaultTrackMock }) => {
  const tmpDir = generateTmpDir();
  mkdirp.sync(tmpDir);

  const createApp = proxyquire('../../src/index', {
    './config': {
      dbPath: tmpDir,
      mediaPath: tmpDir,
      screenshotPath: tmpDir,
      trakt: traktMock,
      port: undefined
    }
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

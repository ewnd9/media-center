import proxyquire from 'proxyquire';
import { generateTmpDir } from './create-db';
import mkdirp from 'mkdirp';

const defaultTrackMock = {
  getReport: () => {},
  search: () => {}
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

  return createApp();
};

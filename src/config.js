import path from 'path';
import mkdirp from 'mkdirp';
import Trakt from 'trakt-utils';

const getPath = (variable, defaultFolder) => {
  const result = process.env[variable] || path.resolve(__dirname, '..', '..', defaultFolder);
  mkdirp.sync(result);

  return result;
};

export const mediaPath = getPath('MEDIA_PATH', 'Downloads');
export const dbPath = getPath('DB_PATH', 'media-center-db');
export const screenshotPath = getPath('SCREENSHOTS_PATH', 'media-center-screenshots');

export const port = process.env.PORT || 3000;

const TRAKT_TOKEN = process.env.TRAKT_TOKEN;

const TRAKT_ID = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const TRAKT_SECRET = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';

export const trakt = new Trakt(TRAKT_ID, TRAKT_SECRET, TRAKT_TOKEN);

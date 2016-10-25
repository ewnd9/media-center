import path from 'path';
import mkdirp from 'mkdirp';
import Trakt from 'trakt-utils';
import TmdbApi from './libs/tmdb-api/';

const ensureDirectory = (parentDirectory, directory) => {
  const result = path.join(parentDirectory || '/tmp', directory);
  mkdirp.sync(result);

  return result;
};

export const mediaPath = (process.env.MEDIA_PATH || '').replace(/\/$/, '');
export const mediaTrashPath = ensureDirectory(mediaPath, '.trash');
export const dataPath = process.env.DATA_PATH;

export const dbPath = ensureDirectory(dataPath, 'media-center-db');
export const screenshotPath = ensureDirectory(dataPath, 'media-center-screenshots');
export const booksPath = ensureDirectory(dataPath, 'media-center-books');

export const errorBoardPath = ensureDirectory(dataPath, 'media-center-error-board') + '/errors.db';
export const errorBoardMount = '/error-board';

export const port = process.env.PORT || 3000;

const TRAKT_TOKEN = process.env.TRAKT_TOKEN;

const TRAKT_ID = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const TRAKT_SECRET = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';

const TMDB_KEY = 'd3350c6d641ee4f16f94a6c0b3b809d1';
export const tmdbApi = new TmdbApi(TMDB_KEY);

export const trakt = new Trakt(TRAKT_ID, TRAKT_SECRET, TRAKT_TOKEN);

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

export const trakt = new Trakt(process.env.TRAKT_ID, process.env.TRAKT_SECRET, null);
export const tmdbApi = new TmdbApi(process.env.TMDB_KEY);

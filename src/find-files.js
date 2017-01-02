import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';
import split from 'split-torrent-release';
import path from 'path';
import getPosterUrl from './utils/poster-url';

const exts = '(mkv|mp4|avi)';
const sampleFilesRegex = /(?:\.|\/)(?:sample|rarbg\.com|etrg)\./i;

export default (db, rootDir) => {
  return findFiles(rootDir)
    .then(mergeFiles.bind(null, db));
};

export function findFiles(rootDir) {
  return globby([`**/*.+${exts}`], { cwd: rootDir, realpath: true })
    .then(allVideos => {
      return allVideos
        .filter(item => !sampleFilesRegex.test(item))
        .map(canonicalPath => {
          const video = canonicalPath.replace(new RegExp('^' + rootDir + '/'), '');
          return {
            canonicalPath,
            video
          };
        });
    });
}

export function mergeFiles(db, videoFiles) {
  return parseVideoFiles(db, videoFiles)
    .then(flattenVideos);
}

function parseVideoFiles(db, videoFiles) {
  const media = videoFiles
    .map(({ canonicalPath, video, isTorrent, isActiveTorrent, torrentProgress, streamUrl }) => {
      const data = video.split('/');

      const media = {
        file: video,
        dir: path.dirname(video),
        fileName: path.basename(video),
        dirName: data[data.length - 2],
        birthtime: fs.statSync(canonicalPath).birthtime,
        isTorrent,
        isActiveTorrent,
        torrentProgress,
        streamUrl
      };

      media.recognition = split(media.fileName || media.dirName);
      return media;
    });

  return Promise
    .all([db.File.getAll(media.map(_ => _.file)), db.Prefix.getAll(media.filter(_ => !!_.recognition))])
    .then(setupDb.bind(null, db, media));
}

function setupDb(db, media, [dbFiles, dbPrefixes]) {
  return media.map(media => {
    media.db = (dbFiles.rows.find(file => {
      return file.doc && file.doc._id === db.File.createId(media.file);
    }) || {}).doc;

    if (media.recognition) {
      const prefix = (dbPrefixes.rows.find(prefix => {
        return prefix.doc && prefix.doc._id === db.Prefix.createId(media.recognition.title);
      }) || {}).doc;

      if (prefix) {
        media.db = media.db || {};

        const copy = (field, value) => {
          if (!media.db[field]) {
            media.db[field] = value;
          }
        };

        copy('type', prefix.type);
        copy('imdb', prefix.imdb);
        copy('title', prefix.title);
        copy('s', media.recognition.s);
        copy('ep', media.recognition.ep);
      }
    }

    return media;
  });
}

const UNRECOGNIZED = 'Unrecognized';

function flattenVideos(result) {
  const groupedByImdbObj = _.groupBy(result, item => {
    return item.db && `${item.db.imdb}-${item.db.s}` || UNRECOGNIZED;
  });

  const groupedByImdb = _.map(groupedByImdbObj, (media, key) => ({ key, media }));

  groupedByImdb.sort((a, b) => {
    const mA = _.max(a.media.map(a => a.birthtime.getTime()));
    const mB = _.max(b.media.map(b => b.birthtime.getTime()));

    return mB - mA;
  });

  groupedByImdb.forEach(group => {
    _.sortBy(group.media, 'db.ep');

    const media = group.media.find(media => media.db || media.recognition) || group.media[0];

    group.dir = media.dir;
    group.media.forEach(media => {
      media.watched = media.db && !!media.db.scrobble;
      media.hidden = media.db && !!media.db.hidden;

      delete media.birthtime;
    });

    const unwatchedCount = group.media.filter(_ => !_.watched).length;
    group.watched = unwatchedCount === 0;
    group.hidden = group.media.every(_ => _.hidden || _.watched);

    if (media.db) {
      group.imdb = media.db.imdb;
      group.s = media.db.s;
      group.type = media.db.type;
      group.title = media.db.title;
      group.unwatchedCount = unwatchedCount;
    }

    group.posterUrl = media.db ? getPosterUrl(media.db.type, media.db.imdb, media.db.s) : getPosterUrl();

    if (media.db && media.db.s) {
      const title = `${media.db.title} season ${media.db.s}`;
      group.summary = `${title} (${unwatchedCount} / ${group.media.length})`;
    } else if (group.key === UNRECOGNIZED) {
      group.summary = `${UNRECOGNIZED} (${group.media.length})`;
    } else {
      const title = media.db && media.db.title || media.recognition && media.recognition.title || media.fileName;
      group.summary = `${title} ${group.media.length > 1 ? '(' + group.media.length + ')' : ''}`;
    }
  });

  return groupedByImdb;
}

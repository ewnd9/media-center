import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';
import split from 'split-torrent-release';

const exts = '(mkv|mp4|avi)';

export default (db, rootDir) => {
  return globby([`**/*.+${exts}`], { cwd: rootDir, realpath: true })
    .then(parseVideoFiles.bind(null, db))
    .then(flattenVideos.bind(null, rootDir));
};

function parseVideoFiles(db, allVideos) {
  const videos = allVideos.filter(item => !((/(?:\.|\/)(?:sample|rarbg\.com)\./i).test(item)));

  const media = videos.map(video => {
    const data = video.split('/');

    const media = {
      file: video,
      dir: data.slice(0, data.length - 1).join('/'),
      fileName: data[data.length - 1],
      dirName: data[data.length - 2],
      birthtime: fs.statSync(video).birthtime,
    };

    media.recognition = split(media.fileName || media.dirName);
    return media;
  });

  return Promise
    .all([db.File.getAll(videos), db.Prefix.getAll(media.filter(_ => !!_.recognition))])
    .then(setupDb.bind(null, db, media));
};

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
};

function flattenVideos(rootDir, result) {
  const groupedByImdbObj = _.groupBy(result, item => {
    return item.db && `${item.db.imdb}-${item.db.s}` || 'unrecognized';
  });

  const groupedByImdb = _.map(groupedByImdbObj, (media, key) => ({ key, media }));

  groupedByImdb.sort((a, b) => {
    const mA = _.max(a.media.map(a => a.birthtime.getTime()));
    const mB = _.max(b.media.map(b => b.birthtime.getTime()));

    return mB - mA;
  });

  groupedByImdb.forEach(group => {
    _.sortBy(group.media, 'db.ep');

    const media = group.media[0];
    group.dir = media.dir;

    if (media.db && media.db.s) {
      const title = `${media.db.title} season ${media.db.s}`;
      const scrobble = group.media.filter(_ => _.db && _.db.scrobble).length;

      group.summary = `${title} (${scrobble} / ${group.media.length})`;
      group.watched = scrobble === group.media.length;
    } else {
      const title = media.recognition && media.recognition.title || media.fileName;
      group.summary = `${title} ${group.media.length > 1 ? '( 0 / ' + group.media.length + ')' : ''}`;
    }
  });

  return groupedByImdb;
};

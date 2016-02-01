import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';
import split from 'split-torrent-release';

const exts = '(mkv|mp4|avi)';

function setupDb(db, media, [dbFiles, dbPrefixes]) {
	return media.map(media => {
		media.db = (dbFiles.rows.find(file => {
			return file.doc && file.doc._id === db.fileId(media.file);
		}) || {}).doc;

		if (media.recognition) {
			const prefix = (dbPrefixes.rows.find(prefix => {
				return prefix.doc && prefix.doc._id === db.prefixId(media.recognition.title);
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

export default (db, rootDir) => {
	return globby([`**/*.+${exts}`], { cwd: rootDir, realpath: true })
		.then(allVideos => {
			const videos = allVideos.filter(item => !((/\.sample\./i).test(item)));

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
				.all([db.getFiles(videos), db.getPrefixes(media.filter(_ => !!_.recognition))])
				.then(setupDb.bind(null, db, media));
		})
		.then(result => {
			const grouped = _.groupBy(result, 'dir');
			const topLevel = grouped[rootDir] || [];
			const media = _
				.map(grouped, (media, dir) => ({ media, dir }))
				.filter(({ dir }) => dir !== rootDir)
				.concat(topLevel.map(media => ({ media: [media], dir: media.dir })));

			const cmpNames = (a, b) => {
				if (a.fileName < b.fileName) {
  				return 1;
				} else if (a.fileName > b.fileName) {
					return -1;
				} else {
					return 0;
				}
			};

			media.sort((a, b) => {
				a.media.sort(cmpNames);
				b.media.sort(cmpNames);

				const mA = _.max(a.media.map(a => a.birthtime.getTime()));
				const mB = _.max(b.media.map(b => b.birthtime.getTime()));

				return mB - mA;
			});

			media.forEach(dirObj => {
				const media = dirObj.media[0];

				if (media.db && media.db.s) {
					const title = `${media.db.title} season ${media.db.s}`;
					const scrobble = _.sum(_.pluck(dirObj.media, 'scrobble'));

					dirObj.summary = `${title} (${scrobble} / ${dirObj.media.length})`;
					dirObj.watched = scrobble === dirObj.media.length;
				} else {
					const title = media.recognition && media.recognition.title || media.fileName;
					dirObj.summary = `${title} ${dirObj.media.length > 1 ? '( 0 / ' + dirObj.media.length + ')' : ''}`;
				}
			});

			return media;
		});
};

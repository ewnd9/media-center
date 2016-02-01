import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';
import split from 'split-torrent-release';

const loadRecognition = (db, item) => {
	item.recognition = split(item.filename || item.dirname);

	if (!item.recognition) {
		return Promise.resolve(item);
	} else {
		return db
			.getPrefix(item.recognition.title)
			.then((res) => {
				if (res.type !== item.recognition.type) {
					return;
				}

				item.db = item.db || {};

				if (!item.db.type) {
					item.db.type = res.type;
				}

				if (!item.db.imdb) {
					item.db.imdb = res.imdb;
				}

				if (!item.db.title) {
					item.db.title = res.title;
				}

				if (!item.db.s) {
					item.db.s = item.recognition.s;
				}

				if (!item.db.ep) {
					item.db.ep = item.recognition.ep;
				}
			}, (err) => {
				if (err.status !== 404) {
					throw err;
				}
			})
			.then(() => item);
	}
};

const loadFile = (dbFiles, db, item) => {
	const file = dbFiles.find(file => {
		return file.doc && file.doc._id === db.fileId(item.file);
	});

	if (file) {
		item.db = file.doc;
	}

	return loadRecognition(db, item);
};

const exts = '(mkv|mp4|avi)';

export default (db, dir) => {
	return globby([`**/*.+${exts}`], { cwd: dir, realpath: true })
		.then(items => {
			const flatFiles = items
				.filter(item => !((/\.sample\./i).test(item))) // I've failed with negative pattern in globby :(
				.map(item => {
					const data = item.split('/');
					const dir = data.slice(0, data.length - 1).join('/');

					return {
						dir,
						file: item,
						filename: data[data.length - 1],
						dirname: data[data.length - 2]
					};
				});

			const grouped = _.groupBy(flatFiles, 'dir');

			const combined = _.map(grouped, (curr, dir) => ({ curr, dir }));
			const [firstLevel, others] = _.partition(combined, x => x.dir === dir);

			let flatten;

			if (firstLevel.length === 1) {
				const xs = firstLevel[0].curr.map(file => ({
					curr: [file],
					dir: firstLevel[0].dir
				}));

				flatten = others.concat(xs);
			} else {
				flatten = others;
			}

			const files = flatten.reduce((result, { curr }) => {
				return result.concat(curr.map(_ => _.file));
			}, []);

			const result = db
				.getFiles(files)
				.then(res => {
					return Promise.reduce(flatten, (result, { curr, dir }) => {
						if (curr.length === 1) {
							const item = curr[0];
							item.birthtime = fs.statSync(item.dir).birthtime;

							return loadFile(res.rows, db, item)
								.then(() => {
									result.push(item);
									return result;
								});
						} else {
							return Promise
								.map(curr, item => loadFile(res.rows, db, item))
								.then((res) => {
									const item = {
										dir,
										dirname: curr[0].dirname,
										contents: res,
										birthtime: fs.statSync(dir).birthtime
									};

									result.push(item);
									return loadRecognition(db, item);
								})
								.then(() => result);
						}

						return result;
					}, []);
				});

			return result;
		})
		.then((result) => {
			result.sort((a, b) => b.birthtime - a.birthtime);
			result.forEach((folder) => {
				if (folder.contents) {
					const summary = folder.contents.reduce((total, curr) => {
						if (curr.db && curr.db.s) {
							const key = `${curr.db.title} season ${curr.db.s}`;

							total[key] = total[key] || {};
							total[key].count = (total[key].count || 0) + 1;
							total[key].scrobble = (total[key].scrobble || 0) + (curr.db.scrobble ? 1 : 0);
						} else if (curr.db) {
							total[curr.db.title] = true;
						} else {
							total[curr.filename] = true;
						}

						return total;
					}, {});

					folder.summary = _.map(summary, (data, title) => ({ title, data }));
				}
			});

			return result;
		});
};

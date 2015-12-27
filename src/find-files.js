import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';
import split from 'split-torrent-release';

const loadFile = (db, item) => {
	return db
		.getFile(item.file).then((res) => res, (err) => {
			if (err.status !== 404) {
				throw err;
			}

			return undefined;
		}).then((res) => {
			item.db = res;
			item.recognition = split(item.filename);

			return db
				.getPrefix(item.recognition.title)
				.then((res) => {
					item.recognition = {
						...item.recognition,
						...res
					};
				}, (err) => {
					if (err.status !== 404) {
						throw err;
					}
				})
				.then(() => item);
		});
};

export default (db, dir) => {
	return globby(['**/*.mkv'], { cwd: dir, realpath: true })
		.then(items => {
			const flatFiles = items.map(item => {
				const data = item.split('/');
				const dir = data.slice(0, data.length - 1).join('/');

				return {
					dir,
					file: item,
					filename: data[data.length - 1]
				};
			});

			const grouped = _.groupBy(flatFiles, 'dir');
			const combined = _.map(grouped, (curr, dir) => ({ curr, dir }));

			const result = Promise.reduce(combined, (result, { curr, dir }) => {
				if (curr.length === 1) {
					const item = curr[0];
					item.birthtime = fs.statSync(curr[0].dir).birthtime;

					return loadFile(db, item)
						.then((res) => {
							result.push(item);
							return result;
						});
				} else {
					return Promise
						.map(curr, (item) => loadFile(db, item))
						.then((res) => {
							result.push({
								dir,
								contents: res,
								birthtime: fs.statSync(dir).birthtime
							});

							return result;
						});
				}

				return result;
			}, []);

			return result;
		})
		.then((result) => {
			result.sort((a, b) => b.birthtime - a.birthtime);
			return result;
		});
};

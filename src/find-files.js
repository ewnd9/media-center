import globby from 'globby';
import fs from 'fs';
import _ from 'lodash';

export default (dir) => {
	return globby(['**/*.mkv'], { cwd: dir, realpath: true })
		.then(items => {
			const flatFiles = items.map(item => {
				const data = item.split('/');
				const dir = data.slice(0, data.length - 1).join('/');

				return {
					dir,
					file: data[data.length - 1]
				};
			});

			const grouped = _.groupBy(flatFiles, 'dir');

			const result = _.reduce(grouped, (result, curr, dir) => {
				if (curr.length === 1) {
					curr[0].birthtime = fs.statSync(curr[0].dir).birthtime;
					result.push(curr[0]);
				} else {
					const item = {
						dir,
						contents: curr,
						birthtime: fs.statSync(dir).birthtime
					};

					result.push(item);
				}

				return result;
			}, []);

			result.sort((a, b) => b.birthtime - a.birthtime)
			return result;
		});
};

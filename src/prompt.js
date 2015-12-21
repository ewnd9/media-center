import inquirer from 'inquirer-question';
import * as trakt from './trakt';

export default () => {
	const data = {};

	return inquirer.prompt([{
	  type: 'list',
	  message: 'type',
		name: 'type',
		choices: ['show', 'movie']
	}, {
		type: 'input',
		message: 'title',
		name: 'title'
	}, {
		type: 'input',
		message: 's',
		name: 's'
	}, {
		type: 'input',
		message: 'ep',
		name: 'ep'
	}]).then((result) => {
		data.s = parseInt(result.s);
		data.ep = parseInt(result.ep);
		data.type = result.type;

    return trakt.search(result.title, result.type);
	}).then((result) => {
		const mapping = data.type === 'show' ? (item) => ({
			name: `${item.show.title} (${item.show.year}) [${item.show.status}] ${item.show.ids.imdb}`,
			value: {
				show: item.show,
				imdb: item.show.ids.imdb
			}
		}) : (item) => ({
			name: `${item.movie.title} (${item.movie.year}) ${item.movie.ids.imdb}`,
			value: {
				movie: item.movie,
				imdb: item.movie.ids.imdb
			}
		});

		return inquirer.prompt({
			type: 'list',
			message: 'media',
			name: 'imdb',
			choices: result.map(mapping)
		});
	}).then((result) => {
		return {
			...data,
			...result.imdb
		};
	}).catch((err) => {
		console.log(err);
	});
};

import inquirer from 'inquirer-question';
import selectImdb from 'pw3/lib/helpers/select-imdb-task';

export default () => {
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
		result.s = parseInt(result.s);
		result.ep = parseInt(result.ep);

		return selectImdb.run(result.title).then((imdbResult) => {
			result.imdb = imdbResult.imdb;
			return result;
		});
	}).catch((err) => {
		console.log(err);
	});
};

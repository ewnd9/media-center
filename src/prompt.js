import inquirer from 'inquirer-question';
import imdb from 'pw3/lib/api/imdb';
import selectImdb from 'pw3/lib/prompts/select-media';

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

    return imdb.search(result.title, result.type === 'show' ? 'TV' : 'M').then((data) => {
      return selectImdb(data);
    }).then((imdbResult) => {
			result.imdb = imdbResult.imdb;
			return result;
    });
	}).catch((err) => {
		console.log(err);
	});
};

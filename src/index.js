import * as player from './player';
import prompt from './prompt';

import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import inquirerCredentials from 'inquirer-credentials';

import { setToken } from './trakt';


var token = {
  name: 'token',
  type: 'input',
  env: 'TRAKT_TOKEN'
};

inquirerCredentials('.media-center-npm', [token]).then((credentials) => {
  setToken(credentials.token);
	var file = process.argv.slice(2).join(' ');

	var fileDir = path.dirname(file);
	var ext = path.extname(file);
	var fileBase = path.basename(file, ext);

	var nfoPath = fileDir + '/' + fileBase + '.media-center-nfo';
	var dataPromise = null;

	if (fs.existsSync(nfoPath)) {
		var data = fs.readFileSync(nfoPath, 'utf-8');
		dataPromise = Promise.resolve(JSON.parse(data));
	} else {
		var dataPromise = prompt().then((result) => {
			fs.writeFileSync(nfoPath, JSON.stringify(result, null, 2), 'utf-8');
			return result;
		});
	}

	dataPromise.then((result) => {
		player.run(file, result.imdb, result.s, result.ep);
	});
});

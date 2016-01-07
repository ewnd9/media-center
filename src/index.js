import prompt from './prompt';
import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import inquirerCredentials from 'inquirer-credentials';
import meow from 'meow';

import { setToken } from './trakt';
import storage, { OPEN_MEDIA } from './storage';

let token = {
  name: 'token',
  type: 'input',
  env: 'TRAKT_TOKEN'
};

let cli = meow(`
    Usage
      $ media-center <file>

    Options
      -p player (vlc or omx)
`, {
  pkg: './../package.json'
});

let player = null;

if (cli.flags.p === 'vlc') {
  player = require('./players/vlc');
} else if (cli.flags.p === 'omx') {
  player = require('./players/omx');
} else {
  cli.showHelp();
  process.exit(1);
}

inquirerCredentials('.media-center-npm', [token]).then((credentials) => {
  setToken(credentials.token);
	let file = cli.input.join(' ');

	let fileDir = path.dirname(file);
	let ext = path.extname(file);
	let fileBase = path.basename(file, ext);

	let nfoPath = fileDir + '/' + fileBase + '.media-center-nfo';
	let dataPromise = null;

	if (fs.existsSync(nfoPath)) {
		let data = fs.readFileSync(nfoPath, 'utf-8');
		dataPromise = Promise.resolve(JSON.parse(data));
	} else {
		dataPromise = prompt().then((result) => {
			fs.writeFileSync(nfoPath, JSON.stringify(result, null, 2), 'utf-8');
			return result;
		});
	}

	dataPromise.then((result) => {
    storage.emit(OPEN_MEDIA, result);
		player(file);
	});
});

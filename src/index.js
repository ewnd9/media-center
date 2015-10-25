import prompt from './prompt';
import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';
import inquirerCredentials from 'inquirer-credentials';
import meow from 'meow';

import { setToken } from './trakt';
import storage, { OPEN_MEDIA } from './storage';

var token = {
  name: 'token',
  type: 'input',
  env: 'TRAKT_TOKEN'
};

var cli = meow(`
    Usage
      $ media-center <file>

    Options
      -p player (vlc or omx)
`, {
  pkg: './../package.json'
});

var player = null;

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
	var file = cli.input.join(' ');

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
    storage.emit(OPEN_MEDIA, result);
		player(file);
	});
});

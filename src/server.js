import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import storage from './storage';
import initDb from './db';
import HTTP from 'http';
import socketIO from 'socket.io';
import Trakt from 'trakt-utils';
import Router from './routes/index';

import {
	UPDATE_PLAYBACK,
	STOP_PLAYBACK,
	USER_PAUSE_MEDIA,
	USER_CLOSE
} from './constants';

const MEDIA_PATH = process.env.MEDIA_PATH || '/home/ewnd9/Downloads';
const PORT = process.env.PORT || 3000;
const TRAKT_TOKEN = process.env.TRAKT_TOKEN;
const DB_PATH = process.env.DB_PATH || '/home/ewnd9/media-center-db';

const traktId = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const traktSecret = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';
const trakt = new Trakt(traktId, traktSecret, TRAKT_TOKEN);

const db = initDb(DB_PATH + '/' + 'db');
const app = express();

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(morgan('request: :remote-addr :method :url :status'));
app.use(express.static('public'));
app.use(cors());

let play;

if (process.env.NODE_ENV === 'production') {
	play = require('./players/omx').default;
} else {
	play = require('./players/mock-player').default;
}

app.use('/', Router(MEDIA_PATH, db, trakt, play));

app.use((err, res) => {
	res.status(500).json({ error: err.stack });
});

const http = HTTP.Server(app);
const io = socketIO(http);

const proxyEvents = [USER_PAUSE_MEDIA, USER_CLOSE].map(event => ({
	event,
	fn: () => storage.emit(event)
}));

let lastPlaybackStatus;

io.on('connection', (socket) => {
	socket.emit(UPDATE_PLAYBACK, lastPlaybackStatus);

	proxyEvents.forEach(({ event, fn }) => {
		socket.on(event, fn);
	});
});

[UPDATE_PLAYBACK, STOP_PLAYBACK].forEach(event => {
	storage.on(event, data => {
		lastPlaybackStatus = data;
		io.emit(event, data);
	});
});

http.listen(PORT, () => {
	console.log(`listen localhost:${PORT}`);
});

import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import globby from 'globby';
import play from './players/omx';
import storage, { UPDATE_PLAYBACK } from './storage';
import initDb from './db';
import findFiles from './find-files';
import HTTP from 'http';
import socketIO from 'socket.io';
import Trakt from 'trakt-utils';

const MEDIA_PATH = process.env.MEDIA_PATH || '/home/ewnd9/Downloads';
const PORT = process.env.PORT || 3000;
const TRAKT_TOKEN = process.env.TRAKT_TOKEN;
const DB_PATH = process.env.DB_PATH || '/home/ewnd9/media-center-db';

const traktId = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const traktSecret = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';
const trakt = new Trakt(traktId, traktSecret, TRAKT_TOKEN);

const db = initDb(DB_PATH + '/' + 'db');
const app = express();

let player;

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(morgan('request: :remote-addr :method :url :status'));
app.use(express.static('public'));
app.use(cors());

const addToHistory = (filename, media) => {
	return trakt
		.addToHistory(media)
		.then(() => db.updateFile(filename, {
			scrobble: true,
			scrobbleAt: new Date().toISOString()
		}));
};

app.get('/api/v1/files', (req, res) => {
	findFiles(db, MEDIA_PATH)
		.then(_ => res.json(_))
		.catch(err => {
			console.log(err);
			res.json(err);
		});
});

app.get('/api/v1/playback/status', (req, res) => {
	if (player) {
		res.json(player.getInfo());
	} else {
		res.json({ status: null });
	}
});

app.post('/api/v1/playback/start', (req, res) => {
	db.addFile(req.body.filename, req.body.media);

	if (process.env.NODE_ENV === 'production') {
		play(trakt, addToHistory, db, req.body.media, req.body.filename, req.body.position)
			.then(_player => player = _player)
	} else {
		console.log(process.env.NODE_ENV);
	}

	res.json({ status: 'ok' });
});

app.post('/api/v1/playback/info', (req, res) => {
	db.addFile(req.body.filename, req.body.media)
		.then(() => res.json({ status: 'ok '}))
		.catch(err => res.json(err));
});

app.post('/api/v1/history', (req, res) => {
	addToHistory(req.body.filename, req.body.media)
		.then(_ => res.json({ status: 'ok' }))
		.catch(err => res.json({ status: 'err' }));
});

const formatSuggestion = (media) => {
	return {
		value: media.ids.imdb,
		label: `${media.title} (${media.year})`
	};
};

app.get('/api/v1/suggestions', (req, res) => {
	trakt
		.search(req.query.title, req.query.type)
		.then((data) => {
			res.json(data.map(media => formatSuggestion(media[req.query.type])));
		})
		.catch(err => res.json([]));
});

const http = HTTP.Server(app);
const io = socketIO(http);

storage.on(UPDATE_PLAYBACK, () => io.emit('PAUSE_MEDIA'));

http.listen(PORT, () => {
	console.log(`listen localhost:${PORT}`);
});

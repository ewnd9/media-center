import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'express-cors';
import globby from 'globby';
import play from './players/omx';
import * as trakt from './trakt';
import storage, { OPEN_MEDIA } from './storage';
import initDb from './db';
import findFiles from './find-files';

const MEDIA_PATH = process.env.MEDIA_PATH || '/home/ewnd9/Downloads';
const PORT = process.env.PORT || 3000;
const TRAKT_TOKEN = process.env.TRAKT_TOKEN;
const DB_PATH = process.env.DB_PATH || '/home/ewnd9/media-center-db';

const db = initDb(DB_PATH + '/' + 'db');

trakt.setToken(TRAKT_TOKEN);
const app = express();

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(morgan('request: :remote-addr :method :url :status'));
app.use(express.static('public'));

app.use(cors({
	allowedOrigins: [
		'localhost:3000',
		'localhost:8080',
		'localhost:8000',
	]
}));

app.get('/api/v1/files', (req, res) => {
	findFiles(db, MEDIA_PATH)
		.then(_ => res.json(_))
		.catch(err => {
			console.log(err);
			res.json(err);
		});
});

app.post('/api/v1/playback/start', (req, res) => {
	db.addFile(req.body.filename, req.body.media);
	storage.emit(OPEN_MEDIA, req.body.media);

	if (process.env.NODE_ENV === 'production') {
		play(db, req.body.filename);
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
	trakt.addToHistory(db, req.body.filename, req.body.media)
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

const server = app.listen(PORT, () => {
	console.log(`listen localhost:${PORT}`);
});

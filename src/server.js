import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'express-cors';
import globby from 'globby';
import play from './players/omx';

const MEDIA_PATH = process.env.MEDIA_PATH;
const PORT = process.env.PORT || 3000;

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
	globby(['**/*.mkv'], { cwd: MEDIA_PATH, realpath: true }).then((paths) => {
		res.json(paths);
	});
});

app.post('/api/v1/playback/start', (req, res) => {
	play(req.body.filename);
	res.json({ status: 'ok' });
});

var server = app.listen(PORT, () => {
	console.log(`listen localhost:${PORT}`);
});

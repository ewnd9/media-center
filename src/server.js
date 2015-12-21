import express from 'express';
import morgan from 'morgan';
import cors from 'express-cors';

const app = express();

app.use(morgan('request: :remote-addr :method :url :status'));
app.use(express.static('public'));
app.use(cors({
	allowedOrigins: [
		'localhost:3000',
		'localhost:8080',
		'localhost:8000',
	]
}));

var server = app.listen(3000, () => {
	console.log('localhost:3000');
});

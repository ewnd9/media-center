import OMXPlayer from 'omxplayer';
import { startScrobble, stopScrobble, getShowData } from './trakt';

export let run = (file, imdb, s, ep) => {
	var configuration = {};
	var omxplayer = new OMXPlayer(configuration);

	var getData = () => {
		return getShowData(imdb, s, ep, position / duration * 100);
	};

	var duration = 0;
	var position = 0;

	omxplayer.start(file, function(error) {
		setTimeout(() => {
			startScrobble(getData());
		}, 1000);
	});

	omxplayer.on('prop:Duration', (_duration) => {
		duration = _duration;
	})

	omxplayer.on('prop:Position', (_position) => {
		position = _position;
	});

	omxplayer.on('prop:PlaybackStatus', (status) => {
		if (status === 'Playing') {
			startScrobble(getData());
		} else if (status === 'Paused') {
			stopScrobble(getData());
		}
	});

	process.stdin.setRawMode(true);
	process.stdin.pipe(omxplayer._omxProcess.stdin);

	omxplayer.on('stopped', () => {
		process.stdin.setRawMode(false);
		process.stdin.unpipe();

		stopScrobble(getData());
	});
};

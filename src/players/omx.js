import OMXPlayer from 'omxplayer';
import storage, { PLAY_MEDIA, PAUSE_MEDIA } from './../storage';

export default (file) => {
	var configuration = {};
	var omxplayer = new OMXPlayer(configuration);

	var duration = 0;
	var position = 0;

	omxplayer.start(file, function(error) {
		setTimeout(() => {
			storage.emit(PLAY_MEDIA, position / duration * 100);
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
			storage.emit(PLAY_MEDIA, position / duration * 100);
		} else if (status === 'Paused') {
			storage.emit(PAUSE_MEDIA, position / duration * 100);
		}
	});

	process.stdin.setRawMode(true);
	process.stdin.pipe(omxplayer._omxProcess.stdin);

	omxplayer.on('stopped', () => {
		process.stdin.setRawMode(false);
		process.stdin.unpipe();

		storage.emit(PAUSE_MEDIA, position / duration * 100);
	});
};

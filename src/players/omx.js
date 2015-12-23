import OMXPlayer from './../vendor/omxplayer';
import storage, { PLAY_MEDIA, PAUSE_MEDIA, USER_PAUSE_MEDIA, USER_CLOSE } from './../storage';
import fkill from 'fkill';
import { registerKeys, unregisterKeys } from './../x11';

let omxplayer = null;

const killProcess = () => {
	unregisterKeys();
	return fkill('omxplayer.bin').then(() => console.log('success'), (err) => console.log(err));
};

storage.on(USER_PAUSE_MEDIA, () => {
	if (omxplayer) {
		omxplayer.pause();
	}
});

storage.on(USER_CLOSE, () => {
	killProcess();
});

export default (file) => {
	return killProcess().then(registerKeys).then(() => {
		var configuration = {};
		omxplayer = new OMXPlayer(configuration);

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

		omxplayer.on('stopped', () => {
			storage.emit(PAUSE_MEDIA, position / duration * 100);
		});
	});
};

import fkill from 'fkill';
import exitHook from 'exit-hook';

import OMXPlayer from './../vendor/omxplayer';
import storage, {
	PLAY_MEDIA,
	PAUSE_MEDIA,
	USER_PAUSE_MEDIA,
	USER_CLOSE,
	USER_NEXT_AUDIO,
	USER_SEEK_FORWARD,
	USER_TOGGLE_SUBTITLES,
	USER_TOGGLE_VIDEO,
	SCROBBLE
} from './../storage';
import { registerKeys, unregisterKeys } from './../x11';

let omxplayer = null;
let currentAudioStream;

const killProcess = () => {
	unregisterKeys();
	return fkill('omxplayer.bin').then(() => console.log('success'), (err) => console.log(err));
};

exitHook(killProcess);

storage.on(USER_PAUSE_MEDIA, () => {
	if (omxplayer) {
		omxplayer.pause();
	}
});

storage.on(USER_NEXT_AUDIO, () => {
	if (omxplayer) {
		omxplayer.getListAudio((err, list) => {
			currentAudioStream = (currentAudioStream + 1) % list.length;
			omxplayer.selectAudio(currentAudioStream);
		});
	}
});

storage.on(USER_SEEK_FORWARD, () => {
	if (omxplayer) {
		omxplayer.seek(30);
	}
});

storage.on(USER_CLOSE, () => {
	killProcess();
});

let subtitlesState = false;
storage.on(USER_TOGGLE_SUBTITLES, () => {
	if (omxplayer) {
		if (subtitlesState) {
			omxplayer.showSubtitles();
			console.log('turning on subtitles');
		} else {
			omxplayer.hideSubtitles();
			console.log('turning off subtitles');
		}

		subtitlesState = !subtitlesState;
	}
});

let videoState = false;
storage.on(USER_TOGGLE_VIDEO, () => {
	if (omxplayer) {
		if (videoState) {
			omxplayer.hideVideo();
			console.log('turning off video');
		} else {
			omxplayer.unHideVideo();
			console.log('turning on video');
		}

		videoState = !videoState;
	}
});

export default (db, file) => {
	return killProcess().then(registerKeys).then(() => {
		currentAudioStream = 0;

		let configuration = {};
		omxplayer = new OMXPlayer(configuration);

		let duration = 0;
		let position = 0;

		omxplayer.start(file, function(error) {
			setTimeout(() => {
				storage.emit(PLAY_MEDIA, position / duration * 100);
			}, 1000);
		});

		omxplayer.on('prop:Duration', (_duration) => {
			duration = _duration;
		})

		let positionCount = 0;

		omxplayer.on('prop:Position', (_position) => {
			position = _position;

			if (positionCount % 10 === 0) {
				db.updateFile(file, { position, duration })
					.then((res) => {
						const pos = position / duration * 100;

						if (!res.scrobble && pos !== Infinity && pos > 80) {
							storage.emit(SCROBBLE, { db, filename: file });
						}
					});
			}

			positionCount = (positionCount + 1) % 10;
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

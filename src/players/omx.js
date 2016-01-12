import fkill from 'fkill';
import exitHook from 'exit-hook';

import OMXPlayer from './../vendor/omxplayer';

import storage from './../storage';

import {
	UPDATE_PLAYBACK,
	STOP_PLAYBACK,
	USER_PAUSE_MEDIA,
	USER_CLOSE,
	USER_NEXT_AUDIO,
	USER_SEEK_FORWARD,
	USER_TOGGLE_SUBTITLES,
	USER_TOGGLE_VIDEO,
	PLAYING,
	PAUSED,
	STOPPED
} from './../constants';

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

const tr = h => h < 10 ? ('0' + h) : ('' + h);

export default (trakt, addToHistory, db, media, file, prevPosition) => {
	return killProcess().then(registerKeys).then(() => {
		currentAudioStream = 0;

		const configuration = {};

		if (prevPosition) {
			const seconds = prevPosition / 1000 / 1000;
			const positionTime = `${tr(seconds / 60 / 60 | 0)}:${tr(seconds / 60 | 0)}:${tr(seconds % 60 | 0)}`;

			configuration.omxPlayerParams = ['--pos', positionTime];
		}

		omxplayer = new OMXPlayer(configuration);

		let duration = 0;
		let position = 0;
		let status;

		const progress = () => position / duration * 100;

		const getInfo = () => ({
			progress: progress(),
			position,
			duration,
			status,
			media
		});

		const emitUpdate = () => storage.emit(UPDATE_PLAYBACK, getInfo());

		const emitPlay = () => {
			trakt.startScrobble(media, progress());
			emitUpdate();
		};

		const emitPause = () => {
			trakt.pauseScrobble(media, progress());
			emitUpdate();
		};

		const emitStop = () => {
			trakt.pauseScrobble(media, progress());
			emitUpdate();
			storage.emit(STOP_PLAYBACK);
		};

		omxplayer.start(file, (err) => {
			if (err) {
				console.log(err);
			}

			setTimeout(emitPlay, 1000);
		});

		omxplayer.on('prop:Duration', (_duration) => {
			duration = _duration;
		});

		let positionCount = 0;

		omxplayer.on('prop:Position', (_position) => {
			position = _position;
			emitUpdate();

			if (positionCount % 10 === 0) {
				db.updateFile(file, { position, duration })
					.then((res) => {
						const pos = position / duration * 100;

						if (!res.scrobble && pos !== Infinity && pos > 80) {
							addToHistory(file, media);
						}
					});
			}

			positionCount = (positionCount + 1) % 10;
		});

		omxplayer.on('prop:PlaybackStatus', (omxStatus) => {
			if (omxStatus === 'Playing') {
				status = PLAYING;
				emitPlay();
			} else if (omxStatus === 'Paused') {
				status = PAUSED;
				emitPause();
			}
		});

		omxplayer.on('stopped', () => {
			status = STOPPED;
			emitStop();
		});

		return { getInfo };
	});
};

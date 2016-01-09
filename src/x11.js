import storage, {
	USER_PAUSE_MEDIA,
	USER_CLOSE,
	USER_NEXT_AUDIO,
	USER_SEEK_FORWARD,
	USER_TOGGLE_SUBTITLES,
	USER_TOGGLE_VIDEO
} from './storage';
import Promise from 'bluebird';
import x11 from 'x11';
import _ from 'lodash';

const noKeyModifier = 0;
const ctrlKeyModifier = 4;

const events = {};

const space = 65;
events[space] = USER_PAUSE_MEDIA;

const keyC = 54;
events[keyC] = USER_NEXT_AUDIO;
const keyV = 55;
events[keyV] = USER_SEEK_FORWARD;

const keyS = 39;
events[keyS] = USER_TOGGLE_SUBTITLES;
const keyD = 40;
events[keyD] = USER_TOGGLE_VIDEO;

const esc = 9;
events[esc] = USER_CLOSE;

const pointerMode = false;
const keyboardMode = true;

let X;
let root;

const grabKeys = () => {
	_.map(events, (event, key) => {
		X.GrabKey(root, 0, noKeyModifier, key, false, true);
	});
};

export const registerKeys = () => {
	if (!X) {
		return new Promise((resolve, reject) => {
			x11.createClient(function(err, display) {
				if (err) {
					reject(err);
				}

				X = display.client;
				root = display.screen[0].root;

				grabKeys();
				resolve();
			}).on('event', function(event) {
				console.log(event.keycode, events[event.keycode]);

				if (event.name === 'KeyPress') {
					storage.emit(events[event.keycode]);
				}
			});
		});
	} else {
		grabKeys();
		return Promise.resolve();
	}
};

export const unregisterKeys = () => {
	if (X) {
		_.map(events, (event, key) => {
			X.UngrabKey(root, key, 0);
		});
	}
};

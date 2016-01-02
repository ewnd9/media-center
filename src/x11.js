import storage, { USER_PAUSE_MEDIA, USER_CLOSE, USER_NEXT_AUDIO, USER_SEEK_FORWARD } from './storage';
import Promise from 'bluebird';
import x11 from 'x11';

const noKeyModifier = 0;
const ctrlKeyModifier = 4;

const space = 65;
const keyC = 54;
const keyV = 55;
const esc = 9;

const pointerMode = false;
const keyboardMode = true;

const events = {};

events[space] = USER_PAUSE_MEDIA;
events[esc] = USER_CLOSE;
events[keyC] = USER_NEXT_AUDIO;
events[keyV] = USER_SEEK_FORWARD;

let X;
let root;

const grabKeys = () => {
	X.GrabKey(root, 0, noKeyModifier, space, false, true);
	X.GrabKey(root, 0, noKeyModifier, esc, false, true);
	X.GrabKey(root, 0, noKeyModifier, keyC, false, true);
	X.GrabKey(root, 0, noKeyModifier, keyV, false, true);
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
		X.UngrabKey(root, space, 0);
		X.UngrabKey(root, esc, 0);
		X.UngrabKey(root, keyC, 0);
		X.UngrabKey(root, keyV, 0);
	}
};

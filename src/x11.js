import storage, { USER_PAUSE_MEDIA, USER_CLOSE } from './storage';
import Promise from 'bluebird';
import x11 from 'x11';

const noKeyModifier = 0;
const ctrlKeyModifier = 4;

const space = 65;
const esc = 9;

const pointerMode = false;
const keyboardMode = true;

const events = {};

events[space] = USER_PAUSE_MEDIA;
events[esc] = USER_CLOSE;

let X;
let root;

const grabKeys = () => {
	X.GrabKey(root, 0, noKeyModifier, space, false, true);
	X.GrabKey(root, 0, noKeyModifier, esc, false, true);
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
	}
};

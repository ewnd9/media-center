import storage from './storage';

import {
	USER_PAUSE_MEDIA,
	USER_CLOSE,
	USER_NEXT_AUDIO,
	USER_SEEK_FORWARD,
	USER_TOGGLE_SUBTITLES,
	USER_TOGGLE_VIDEO,
	USER_SCREENSHOT,
	USER_SCREEN_OFF,
	USER_OPEN_BROWSER
} from './constants';

import Promise from 'bluebird';
import x11 from 'x11';
import _ from 'lodash';

const noKeyModifier = 0;
// const ctrlKeyModifier = 4;

const playerEvents = {};
const globalEvents = {};

const space = 65;
playerEvents[space] = USER_PAUSE_MEDIA;

const keyZ = 52;
playerEvents[keyZ] = USER_SCREENSHOT;

const keyF7 = 73;
globalEvents[keyF7] = USER_SCREEN_OFF;
const keyF8 = 74;
globalEvents[keyF8] = USER_OPEN_BROWSER;

const keyC = 54;
playerEvents[keyC] = USER_NEXT_AUDIO;
const keyV = 55;
playerEvents[keyV] = USER_SEEK_FORWARD;

const keyS = 39;
playerEvents[keyS] = USER_TOGGLE_SUBTITLES;
const keyD = 40;
playerEvents[keyD] = USER_TOGGLE_VIDEO;

const esc = 9;
playerEvents[esc] = USER_CLOSE;

const pointerMode = false;
const keyboardMode = true;

let X;
let root;

const grabKeys = events => {
	_.map(events, (event, key) => {
		X.GrabKey(root, 0, noKeyModifier, key, pointerMode, keyboardMode);
	});
};

export const registerEvents = events => {
	if (!X) {
		return new Promise((resolve, reject) => {
			x11.createClient(function(err, display) {
				if (err) {
					reject(err);
				}

				X = display.client;
				root = display.screen[0].root;

				grabKeys(events);
				resolve();
			}).on('event', function(event) {
				const action = playerEvents[event.keycode] || globalEvents[event.keycode];
				console.log(event.name, event.keycode, action);

				if (event.name === 'KeyPress') {
					storage.emit(action);
				}
			});
		});
	} else {
		grabKeys(events);
		return Promise.resolve();
	}
};

export const registerKeys = () => registerEvents(playerEvents);
registerEvents(globalEvents);

export const unregisterEvents = events => {
	if (X) {
		_.map(events, (event, key) => {
			X.UngrabKey(root, key, 0);
		});
	}
};

export const unregisterKeys = () => unregisterEvents(playerEvents);

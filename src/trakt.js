import request from 'superagent';
import Promise from 'bluebird';

import storage, {
	PLAY_MEDIA,
	PAUSE_MEDIA,
 	SCROBBLE
} from './storage';

import * as traktUtils from './trakt-utils';

let token = null;
export let setToken = (_token) => token = _token;

storage.on(PLAY_MEDIA, ({ media, progress }) => {
	startScrobble(traktUtils.formatScrobbleData({ media, progress }));
});

storage.on(PAUSE_MEDIA, ({ media, progress }) => {
	pauseScrobble(traktUtils.formatScrobbleData({ media, progress }));
});

storage.on(SCROBBLE, ({ db, filename, media }) => {
	addToHistory(db, filename, media);
});

export let method = (url, data, cb) => {
	console.log(url, JSON.stringify(data, null, 2));
	return new Promise((resolve, reject) => {
		request.post(url)
					 .send(data)
					 .set('Content-Type', 'application/json')
					 .set('Accept', 'application/json')
					 .set('Authorization', 'Bearer ' + token)
					 .set('trakt-api-key', '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f')
					 .set('trakt-api-version', '2')
					 .end((err, res) => {
						 if (err) {
							 reject(err);
						 } else {
							 resolve(res);
						 }
					 });
	});
};

const startScrobble = (data) => {
	return method('https://api-v2launch.trakt.tv/scrobble/start', data);
};

const pauseScrobble = (data) => {
	return method('https://api-v2launch.trakt.tv/scrobble/pause', data);
};

export let addToHistory = (db, filename, data) => {
	return method('https://api-v2launch.trakt.tv/sync/history', traktUtils.formatHistoryData(data))
		.then(() => db.updateFile(filename, { scrobble: true, scrobbleAt: new Date().toISOString() }));
};

export let search = (query, type) => {
	return new Promise((resolve, reject) => {
		request.get('https://api-v2launch.trakt.tv/search')
					 .query({ query, type })
					 .set('Content-Type', 'application/json')
					 .set('Accept', 'application/json')
					 .set('trakt-api-key', '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f')
					 .set('trakt-api-version', '2')
					 .end((err, result) => {
						 if (err) {
							 reject(err);
						 } else {
							 resolve(result.body);
						 }
					 });
	});
};

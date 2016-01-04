import request from 'superagent';
import Promise from 'bluebird';
import storage, {
	OPEN_MEDIA,
	PLAY_MEDIA,
	PAUSE_MEDIA,
 	SCROBBLE
} from './storage';

let token = null;
export let setToken = (_token) => token = _token;

let currMedia = null;
storage.on(OPEN_MEDIA, (data) => {
	currMedia = data;
});
storage.on(PLAY_MEDIA, (progress) => {
	startScrobble(getScrobbleData({ ...currMedia, progress }));
});
storage.on(PAUSE_MEDIA, (progress) => {
	pauseScrobble(getScrobbleData({ ...currMedia, progress }));
});
storage.on(SCROBBLE, ({ db, filename }) => {
	addToHistory(db, filename);
});

export let method = (url, data, cb) => {
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

export let startScrobble = (data) => {
	console.log(JSON.stringify(data, null, 2));
	return method('https://api-v2launch.trakt.tv/scrobble/start', data);
};

export let pauseScrobble = (data) => {
	return method('https://api-v2launch.trakt.tv/scrobble/pause', data);
};

export let getScrobbleData = (data) => {
	if (data.type === 'show') {
		return getScrobbleShowData(data);
	} else if (data.type === 'movie') {
		return getScrobbleMovieData(data);
	}
};

export let getScrobbleShowData = (data) => {
	return {
	  show: {
	    ids: {
	      imdb: data.imdb
	    }
	  },
	  episode: {
	    season: data.s,
	    number: data.ep
	  },
	  progress: data.progress || 0
	};
};

export let getScrobbleMovieData = (data) => {
	return {
		movie: {
			ids: {
				imdb: data.imdb
			}
		},
		progress: data.progress
	};
};

export let addToHistory = (db, filename, data = currMedia) => {
	return method('https://api-v2launch.trakt.tv/sync/history', getHistoryData(data))
		.then(() => db.updateFile(filename, { scrobble: true, scrobbleAt: new Date().toISOString() }));
};

export let getHistoryData = (data) => {
	if (data.type === 'show') {
		return getHistoryShowData(data);
	} else if (data.type === 'movie') {
		return getHistoryMovieData(data);
	}
};

export let getHistoryShowData = (data) => ({
	shows: [{
		ids: {
			imdb: data.imdb
		},
		seasons: [{
			number: data.s,
			episodes: [{
				number: data.ep
			}]
		}]
	}]
});

export let getHistoryMovieData = (data) => ({
	movies: [{
    ids: {
      imdb: data.imdb
    }
  }]
});

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

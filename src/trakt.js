import request from 'superagent';
import storage, { OPEN_MEDIA, PLAY_MEDIA, PAUSE_MEDIA } from './storage';

let token = null;
export let setToken = (_token) => token = _token;

let currMedia = null;
storage.on(OPEN_MEDIA, (data) => {
	currMedia = data;
});
storage.on(PLAY_MEDIA, (progress) => {
	startScrobble(getData({ ...currMedia, progress }));
});
storage.on(PAUSE_MEDIA, (progress) => {
	stopScrobble(getData({ ...currMedia, progress }));
});

export let method = (url, data, cb) => {
	request.post(url)
				 .send(data)
				 .set('Content-Type', 'application/json')
				 .set('Accept', 'application/json')
				 .set('Authorization', 'Bearer ' + token)
				 .set('trakt-api-key', '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f')
				 .set('trakt-api-version', '2')
				 .end(cb);
};

export let startScrobble = (data) => {
	method('https://api-v2launch.trakt.tv/scrobble/start', data, (err, res) => {
		console.log('err', err != null);
	});
};

export let stopScrobble = (data) => {
	method('https://api-v2launch.trakt.tv/scrobble/stop', data, (err, res) => {
		console.log('err', err != null);
	});
};

export let getData = (data) => {
	console.log(data);

	if (data.type === 'show') {
		return getShowData(data);
	} else if (data.type === 'movie') {
		return getMovieData(data);
	}
};

export let getShowData = (data) => {
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
	  progress: data.progress
	};
};

export let getMovieData = (data) => {
	return {
		movie: {
			ids: {
				imdb: data.imdb
			}
		},
		progress: data.progress
	};
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

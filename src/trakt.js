import request from 'superagent';

let token = null;
export let setToken = (_token) => token = _token;

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

export let getShowData = (imdb, s, ep, progress) => {
	return {
	  show: {
	    ids: {
	      imdb: imdb
	    }
	  },
	  episode: {
	    season: s,
	    number: ep
	  },
	  progress: progress
	};
};

import fetch from 'isomorphic-fetch';

export const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export const get = (url) => {
	return fetch(baseUrl + url).then(_ => _.json());
};

export const post = (url, body) => {
	return fetch(baseUrl + url, {
		method: 'post',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
};

export const playFile = (filename, media, position) => {
	return post('/api/v1/playback/start', {
		filename,
		media,
		position
	});
};

export const saveInfo = (filename, media) => {
	return post('/api/v1/playback/info', {
		filename,
		media
	});
};

export const addToHistory = (filename, media) => {
	return post('/api/v1/files/scrobble', {
		filename,
		media
	});
};

export const setHidden = (file, filename) => {
	return post('/api/v1/files/hidden', {
		filename,
		file
	});
};

export const findFiles = () => {
	return get('/api/v1/files');
};

export const getMediaSuggestion = (title, type) => {
  return get('/api/v1/suggestions?title=' + encodeURIComponent(title) + '&type=' + type);
};

export const getReport = () => {
	return get('/api/v1/report');
};

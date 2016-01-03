import fetch from 'isomorphic-fetch';

const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

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

export const playFile = (filename, media) => {
	return post('/api/v1/playback/start', {
		filename,
		media
	});
};

export const addToHistory = (filename, media) => {
	return post('/api/v1/history', {
		filename,
		media
	});
};

export const findFiles = () => {
	return fetch(baseUrl + '/api/v1/files')
		.then(response => response.json())
};

export const getMediaSuggestion = (title, type) => {
  return fetch(baseUrl + '/api/v1/suggestions?title=' + encodeURIComponent(title) + '&type=' + type)
    .then(_ => _.json());
};

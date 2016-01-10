const getScrobbleShowData = ({ media, progress }) => ({
	show: {
	  ids: {
	    imdb: media.imdb
	  }
	},
	episode: {
	  season: media.s,
	  number: media.ep
	},
	progress: progress || 0
});

const getScrobbleMovieData = ({ media, progress }) => ({
	movie: {
		ids: {
			imdb: media.imdb
		}
	},
	progress: progress
});

export const formatScrobbleData = ({ media, progress }) => {
	if (media.type === 'show') {
		return getScrobbleShowData({ media, progress });
	} else if (media.type === 'movie') {
		return getScrobbleMovieData({ media, progress });
	}
};

const getHistoryShowData = (data) => ({
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

const getHistoryMovieData = (data) => ({
	movies: [{
    ids: {
      imdb: data.imdb
    }
  }]
});

export const formatHistoryData = (data) => {
	if (data.type === 'show') {
		return getHistoryShowData(data);
	} else if (data.type === 'movie') {
		return getHistoryMovieData(data);
	}
};

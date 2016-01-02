import PouchDB from 'pouchdb';
import split from 'split-torrent-release';

export default (dbPath) => {
	const db = new PouchDB(dbPath);

	const fileId = (file) => {
		return `file:${file.replace('\W', '')}`;
	};

	const prefixId = (prefix) => {
		return `prefix:${prefix}`;
	};

	const updateFileIfExisted = (err) => {

	};

	const addFile = (file, data) => {
		const _data = file.split('/');
		const filename = _data[_data.length - 1];

		const recognition = split(filename);

		return db
			.put({
				...data,
				_id: fileId(file)
			})
			.then(() => {
				return db.put({
					...data,
					_id: prefixId(recognition.title)
				})
			}, (err) => {
				if (err.name === 'conflict') {
					return db.get(fileId(file)).then((dbData) => {
						return db.put({
							...dbData,
							...data
						});
					})
				} else {
					throw err;
				}
			});
	};

	const getFile = (file) => db.get(fileId(file));
	const getPrefix = (prefix) => db.get(prefixId(prefix));

	return {
		addFile,
		getFile,
		getPrefix
	};
};

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

	const handleError = (err, fn) => {
		if (err.status === 404) {
			return fn();
		} else {
			throw err;
		}
	};

	const putFile = (prevData, newData) => {
		return db.put({
			...prevData,
			...newData,
			updatedAt: new Date().toISOString()
		})
	};

	const postFile = (file, data) => {
		return db.post({
			...data,
			_id: fileId(file)
		});
	};

	const updateFile = (file, data) => {
		return db
			.get(fileId(file))
			.then(
				dbData => putFile(dbData, data),
				err => handleError(err, () => postFile(file, data))
			)
			.then(() => data);
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
					return updateFile(file, data);
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
		getPrefix,
		updateFile
	};
};

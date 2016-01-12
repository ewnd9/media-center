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

	const putDoc = (file, initData, newData = {}) => {
		const doc = {
			...initData,
			...newData,
			updatedAt: new Date().toISOString(),
			_id: fileId(file)
		};

		return db.put(doc).then(() => doc);
	};

	const updateDoc = (id, data) => {
		return db
			.get(id)
			.then(
				dbData => putDoc(id, dbData, data),
				err => handleError(err, () => putDoc(id, data))
			);
	};

	const updateFile = (file, data) => updateDoc(fileId(file), data);

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

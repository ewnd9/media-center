import PouchDB from 'pouchdb';
import split from 'split-torrent-release';

let db;

function Model(createId) {
	this.createId = createId;
};

Model.prototype.on404 = function(err, fn) {
	if (err.status === 404) {
		return fn();
	} else {
		throw err;
	}
};

Model.prototype.get = function(id) {
	return db.get(this.createId(id));
};

Model.prototype.put = function(id, data) {
	const doc = {
		...data,
		_id: this.createId(id),
		updatedAt: new Date().toISOString()
	};

	return db.put(doc).then(() => doc);
};

Model.prototype.update = function(id, data) {
	return this
		.get(id)
		.then(
			dbData => this.put(id, { ...dbData, ...data }),
			err => this.on404(err, () => this.put(id, data))
		);
};

export default (dbPath) => {
	db = new PouchDB(dbPath);

	const fileId = (file) => `file:${file.replace('\W', '')}`;
	const prefixId = (prefix) => `prefix:${prefix}`;

	const File = new Model(fileId);
	const Prefix = new Model(prefixId);

	const updateFile = File.update.bind(File);
	const getFile = File.get.bind(File);
	const getPrefix = Prefix.get.bind(Prefix);

	const getFiles = files => db.allDocs({
		include_docs: true,
		keys: files.map(file => fileId(file))
	});

	const addFile = (file, data) => {
		const parts = file.split('/');
		const filename = parts[parts.length - 1];

		const recognition = split(filename);

		return File
			.update(file, data)
			.then(() => Prefix.update(recognition.title, data));
	};

	return {
		fileId,
		addFile,
		getFile,
		getFiles,
		getPrefix,
		updateFile
	};
};

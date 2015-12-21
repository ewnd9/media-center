import nock, { back as nockBack } from 'nock';
nockBack.fixtures = __dirname + '/../fixtures';

export default (filename) => {
	const data = filename.split('/');
	const fixtureName = data[data.length - 1] + '.json';
	let nockDone = null;

	const beforeFn = () => {
		nockBack.setMode('record');
		nockBack(fixtureName, (_nockDone) => nockDone = _nockDone);
	};

	const afterFn = () => nockDone();

	return {
		beforeFn,
		afterFn
	};
};

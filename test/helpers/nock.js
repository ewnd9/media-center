import nock, { back as nockBack } from 'nock';
nockBack.fixtures = __dirname + '/../fixtures';

function setupNock(filename, functionName) {
  const data = filename.split('/');
  const fixtureName = data[data.length - 1].split('.')[0] + '/' + functionName + '.json';
  let nockDone = null;

  const options = {
    // https://github.com/node-nock/nock/issues/484#issuecomment-191822034
    after: () => nock.enableNetConnect(/(127.0.0.1|localhost)/),
    afterRecord: outputs => outputs.filter(o => !o.scope.match(/(127.0.0.1|localhost)/))
  };

  const beforeFn = () => {
    nockBack.setMode('record');
    nockBack(fixtureName, options, callback => nockDone = callback);
  };

  const afterFn = () => nockDone();

  return {
    beforeFn,
    afterFn
  };
};

export function nockBefore(filename, t) {
  const nock = setupNock(filename, t._test.title.replace('beforeEach for ', '').replace(/[\W\-]+/g, '-'));
  nock.beforeFn();
  return nock;
}

export default (filename, test) => {
  test.beforeEach(t => {
    const nock = nockBefore(filename, t);
    t.context.nockEnd = nock.afterFn;
  });

  test.afterEach(t => {
    t.context.nockEnd();
  });
}

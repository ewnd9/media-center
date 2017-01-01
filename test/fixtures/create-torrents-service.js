import proxyquire from 'proxyquire';
import sinon from 'sinon';

function WebTorrentMock() {
  this.torrents = [];
  this.add = sinon.stub();
}

const service = proxyquire
  .noCallThru()
  .load('../../src/services/torrents-service', {
    webtorrent: WebTorrentMock
  })
  .default;

export default service;

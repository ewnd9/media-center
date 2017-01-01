import WebTorrent from 'webtorrent';

function TorrentsService(config, models) {
  if (!(this instanceof TorrentsService)) {
    return new TorrentsService(config, models);
  }

  this.engine = new WebTorrent({ maxConns: 20 });
  this.mediaPath = config.mediaPath;
}

TorrentsService.prototype.addTorrent = function(magnet) {
  this.engine.add(magnet, { path: this.mediaPath });
};

TorrentsService.prototype.getTorrents = function() {
  const torrents = this.engine.torrents.reduce((result, torrent) => {
    return result.concat(torrent.files.map(file => ({
      canonicalPath: `${this.mediaPath}/${file.path}`,
      video: file.path,
      torrentProgress: file.downloaded / file.length * 100
    })));
  }, []);

  return Promise.resolve(torrents);
};

export default TorrentsService;

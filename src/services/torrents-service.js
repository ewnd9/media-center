import WebTorrent from 'webtorrent';

function TorrentsService(config, models) {
  if (!(this instanceof TorrentsService)) {
    return new TorrentsService(config, models);
  }

  this.engine = new WebTorrent({ maxConns: 20 });
  this.mediaPath = config.mediaPath;
  this.torrentPort = config.torrentPort;

  this.server = null;
  this.activeTorrent = null;
}

TorrentsService.prototype.addTorrent = function(magnet) {
  this.engine.add(magnet, { path: this.mediaPath });
};

TorrentsService.prototype.playTorrent = function(path) {
  if (this.activeTorrent) {
    if (!this.activeTorrent.files.find(file => file.path === path)) {
      this.server && this.server.destroy();
    }
  }

  this.activeTorrent = this.engine.torrents.find(torrent => {
    return torrent.files.find(file => file.path === path);
  });

  if (!this.activeTorrent) {
    return Promise.reject(new Error(`Can't find torrent for "${path}"`));
  }

  this.server = this.activeTorrent.createServer();
  this.server.listen(3001); // hardcode, we're inside a Docker container

  console.log(`listening ${this.torrentPort} for path "${path}"`);
  return this.services.filesService.renewFindFiles();
};

TorrentsService.prototype.getTorrents = function() {
  const torrents = this.engine.torrents.reduce((result, torrent) => {
    return result.concat(torrent.files.map((file, index) => {
      const isActiveTorrent = torrent === this.activeTorrent;
      const result = {
        canonicalPath: `${this.mediaPath}/${file.path}`,
        video: file.path,
        torrentProgress: file.downloaded / file.length * 100,
        isActiveTorrent,
      };

      if (isActiveTorrent) {
        result.streamUrl = `http://localhost:${this.torrentPort}/${index}`; // external port
      }

      return result;
    }));
  }, []);

  return Promise.resolve(torrents);
};

export default TorrentsService;

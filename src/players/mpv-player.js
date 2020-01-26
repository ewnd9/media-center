import { inherits } from 'util';
import BasePlayer from './base';
import Mpv from 'node-mpv';

function MpvPlayer() {
  BasePlayer.apply(this, Array.prototype.slice.apply(arguments));
}

inherits(MpvPlayer, BasePlayer);

MpvPlayer.prototype.play = function({ uri, position }) {
  BasePlayer.prototype.play.apply(this, Array.prototype.slice.apply(arguments));

  this.mpvPlayer = new Mpv();
  this.mpvPlayer.load(this.getFsUri(uri), 'replace', {
    start: 50000
  });
  this.mpvPlayer.once('started', () => {
    console.log({start: position})
    this.mpvPlayer.goToPosition(position);
    // _player.play();
  });
  const metaInfo = {};

  this.mpvPlayer.on('statuschange', status => {
    if (status.path && !metaInfo[status.path]) {
      metaInfo[status.path] = this.mpvPlayer.getProperty('track-list').then(res => {
        const audio = res.filter(item => item.type === 'audio');
        const subtitles = res.filter(item => item.type === 'sub');
        const ret = {
          audio,
          subtitles,
        };
        console.log(ret);
        return ret;
      });
    }
  });

  this.mpvPlayer.on('timeposition', (seconds) => {
    console.log({seconds})
    this.updatePosition(seconds);
  });

  // this.media = this.vlcProcess.mediaFromFile();
  // this.media.parseSync();

  // this.duration = this.media.duration;

  // this.player = this.vlcProcess.mediaplayer;

  // this.player.fullscreen = true;
  // this.player.media = this.media;

  // this.player.play();

  // if (position) {
  //   this.player.position = position * 0.1 / this.media.duration;
  // }

  // this.startPolling();
};

MpvPlayer.prototype.resume = function() {
  BasePlayer.prototype.resume.apply(this);
  // this.mpvPlayer.resume();
};

MpvPlayer.prototype.pause = function() {
  BasePlayer.prototype.pause.apply(this);
  // this.mpvPlayer.pause();
};

MpvPlayer.prototype.stop = function () {
  BasePlayer.prototype.stop.apply(this);
  // this.player.quit();
};

MpvPlayer.prototype.startPolling = function() {
  // this.poller = setInterval(() => {
  //   this.updatePosition(this.player.position * this.duration);
  // }, 1000);
};

MpvPlayer.prototype.stopPolling = function() {
  // clearInterval(this.poller);
};

MpvPlayer.onKeyPress = function(key) {
  // if (key === OMX_KEYS.pause) {
  //   this.togglePlay();
  // } else if (key === OMX_KEYS.stop) {
  //   this.stop();
  // }
};

export default MpvPlayer;

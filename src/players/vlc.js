import { inherits } from 'util';
import BasePlayer from './base';
import vlc from 'vlc';
import { OMX_KEYS } from '../constants';

function VlcPlayer() {
  BasePlayer.apply(this, Array.prototype.slice.apply(arguments));
}

inherits(VlcPlayer, BasePlayer);

VlcPlayer.prototype.play = function({ uri, position }) {
  BasePlayer.prototype.play.apply(this, Array.prototype.slice.apply(arguments));

  this.vlcProcess = vlc([
    '-I', 'dummy',
    '--verbose', '1'
  ]);

  this.media = this.vlcProcess.mediaFromFile(uri);
  this.media.parseSync();

  this.duration = this.media.duration;

  this.player = this.vlcProcess.mediaplayer;

  this.player.fullscreen = true;
  this.player.media = this.media;

  this.player.play();

  if (position) {
    this.player.position = position * 0.1 / this.media.duration;
  }

  this.startPolling();
};

VlcPlayer.prototype.resume = function() {
  BasePlayer.prototype.resume.apply(this);
  this.player.pause(); // vlc bug, always pause, no resume
  this.startPolling();
};

VlcPlayer.prototype.pause = function() {
  BasePlayer.prototype.pause.apply(this);
  this.player.pause();
  this.stopPolling();
};

VlcPlayer.prototype.stop = function () {
  BasePlayer.prototype.stop.apply(this);

  this.player.stop();
  this.media.release();
  this.vlc.release();

  this.stopPolling();
};

VlcPlayer.prototype.startPolling = function() {
  this.poller = setInterval(() => {
    this.updatePosition(this.player.position * this.duration);
  }, 1000);
};

VlcPlayer.prototype.stopPolling = function() {
  clearInterval(this.poller);
};

VlcPlayer.onKeyPress = function(key) {
  if (key === OMX_KEYS.pause) {
    this.togglePlay();
  } else if (key === OMX_KEYS.stop) {
    this.stop();
  }
};

export default VlcPlayer;

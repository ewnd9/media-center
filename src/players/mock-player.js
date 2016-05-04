import BasePlayer from './base';
import notifier from 'node-notifier';

const notify = message => {
  notifier.notify({
    title: 'MOCK PLAYER',
    message
  });
};


function MockPlayer() {
  BasePlayer.apply(this, Array.prototype.slice.apply(this));
}

MockPlayer.prototype.play = function({ uri, position }) {
  BasePlayer.prototype.play.apply(this, Array.prototype.slice.apply(this));

  this.position = 0;
  this.duration = 100 * 60 * 1000 * 1000; // 100 minutes

  this.startPolling();
  notify(`START PLAYING ${uri} ${position ? 'from ' + position : ''}`);
};

MockPlayer.prototype.pause = function () {
  BasePlayer.prototype.pause.apply(this);
  this.stopPolling();
  notify(`NEW STATUS ${this.status}`);
};

MockPlayer.prototype.resume = function () {
  BasePlayer.prototype.resume.apply(this);
  this.startPolling();
  notify(`NEW STATUS ${this.status}`);
};

MockPlayer.prototype.stop = function () {
  BasePlayer.prototype.stop.apply(this);
  this.stopPolling();
  notify(`CLOSE MEDIA`);
};

MockPlayer.prototype.startPolling = function() {
  this.poller = setInterval(() => {
    this.updatePosition(this.position + 1000 * 1000); // 1 second
  }, 1000);
};

MockPlayer.prototype.stopPolling = function() {
  clearInterval(this.poller);
};

export default MockPlayer;

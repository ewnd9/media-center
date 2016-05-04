import BasePlayer from './base';
import { inherits } from 'util';

import OMXPlayer from '../vendor/omxplayer';
import fkill from 'fkill';

function OmxPlayer() {
  BasePlayer.apply(this, Array.prototype.slice.apply(arguments));
}

inherits(OmxPlayer, BasePlayer);

const tr = h => h < 10 ? ('0' + h) : ('' + h);

OmxPlayer.prototype.play = function({ uri, position }) {
  BasePlayer.prototype.play.apply(this, Array.prototype.slice.apply(arguments));

  const configuration = {
    omxPlayerParams: ['--no-osd']
  };

  if (position) {
    const seconds = position / 1000 / 1000;
    const positionTime = `${tr(seconds / 60 / 60 | 0)}:${tr(seconds / 60 | 0)}:${tr(seconds % 60 | 0)}`;

    configuration.omxPlayerParams = configuration.omxPlayerParams.concat(['--pos', positionTime]);
  }

  this.player = new OMXPlayer(configuration);

  this.player.start(uri, err => {
    if (err) {
      console.log(err);
    }
  });

  this.setupCallbacks();
};

OmxPlayer.prototype.setupCallbacks = function() {
  this.player.on('prop:Duration', duration => {
    this.duration = duration;
  });

  this.player.on('prop:Position', position => {
    this.updatePosition(position);
  });

  this.player.on('prop:PlaybackStatus', omxStatus => {
    if (omxStatus === 'Playing') {
      this.resume();
    } else if (omxStatus === 'Paused') {
      this.pause();
    }
  });

  this.player.on('stopped', () => {
    this.stop();
  });
};

OmxPlayer.prototype.stop = function() {
  BasePlayer.prototype.stop.apply(this);
  fkill('omxplayer.bin').then(() => console.log('success'), err => console.log(err));
};

OmxPlayer.prototype.onKeyPress = function(key) {
  if (this.player) {
    this.player._omxProcess.stdin.write(key);
  }
};

export default OmxPlayer;

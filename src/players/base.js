import { UPDATE_PLAYBACK, PLAYING, PAUSED, STOPPED, STOP_PLAYBACK } from '../constants';
import storage from '../storage';

import { registerKeys, unregisterKeys } from '../x11';
import exitHook from 'exit-hook';

function Player(trakt) {
  this.status = STOPPED;
  this.trakt = trakt;

  exitHook(() => this.stop());
}

Player.prototype.play = function({ uri, media, position, traktScrobble }) {
  this.media = media;
  this.uri = uri;
  this.position = position;
  this.traktScrobble = !!traktScrobble;

  this.status = PLAYING;
  if (process.env.MC_X11_SUPPORT) {
    registerKeys();
  }

  if (this.traktScrobble) {
    this.trakt.startScrobble(media, this.getProgress());
  }

  setTimeout(() => this.emitUpdate(), 1000);
};

Player.prototype.getFsUri = function(uri) {
  return this.services.configService.MEDIA_PATH + '/' + uri;
};

Player.prototype.togglePlay = function() {
  if (this.status === PLAYING) {
    this.pause();
  } else {
    this.resume();
  }
};

Player.prototype.resume = function() {
  this.status = PLAYING;
  // registerKeys();

  this.emitUpdate();
};

Player.prototype.pause = function() {
  this.status = PAUSED;
  // unregisterKeys();

  if (this.traktScrobble) {
    this.trakt.pauseScrobble(this.media, this.getProgress());
  }

  this.emitUpdate();
};

Player.prototype.stop = function() {
  this.status = STOPPED;

  if (this.traktScrobble) {
    this.trakt.pauseScrobble(this.media, this.getProgress());
  }

  this.emitUpdate();
  storage.emit(STOP_PLAYBACK);

  if (process.env.MC_X11_SUPPORT) {
    unregisterKeys();
  }
};

Player.prototype.getInfo = function() {
  const result = {
    progress: this.getProgress(),
    position: this.position,
    duration: this.duration,
    status: this.status,
    file: this.uri
  };

  if (this.traktScrobble) {
    result.media = this.media;
  }

  return result;
};

Player.prototype.onKeyPress = function(e) {
  console.log('keyPress', e);
};

let positionCount = 0; // @TODO replace with proper throttle

Player.prototype.updatePosition = function(position) {
  this.position = position;
  this.emitUpdate();

  if (positionCount % 10 === 0) {
    if (this.traktScrobble) {
      this.services.filesService.updatePosition(this.uri, this.media, position, this.duration);
    }
  }

  positionCount = (positionCount + 1) % 10;
};

Player.prototype.getProgress = function() {
  return this.position / this.duration * 100;
};

Player.prototype.emitUpdate = function() {
  storage.emit(UPDATE_PLAYBACK, this.getInfo());
};

Player.prototype.addToHistory = function(filename, media) {
  return this.services.filesService.addToHistory(filename, media);
};

export default Player;

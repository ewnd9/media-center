import { UPDATE_PLAYBACK, PLAYING, PAUSED, STOPPED } from '../constants';
import storage from '../storage';

import { registerKeys, unregisterKeys } from '../x11';

function Player(filesService, trakt) {
  this.filesService = filesService;
  this.status = STOPPED;
  this.trakt = trakt;
}

Player.prototype.play = function({ uri, media, position, traktScrobble }) {
  this.media = media;
  this.uri = uri;
  this.position = position;
  this.traktScrobble = !!traktScrobble;

  this.status = PLAYING;
  registerKeys();

  if (this.traktScrobble) {
    this.trakt.startScrobble(media, this.getProgress());
  }
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
  registerKeys();
};

Player.prototype.pause = function() {
  this.status = PAUSED;
  unregisterKeys();

  if (this.traktScrobble) {
    this.trakt.pauseScrobble(this.media, this.getProgress());
  }
};

Player.prototype.stop = function() {
  this.status = STOPPED;

  if (this.traktScrobble) {
    this.trakt.pauseScrobble(this.media, this.getProgress());
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

let positionCount = 0;

Player.prototype.updatePosition = function(position) {
  this.emitUpdate();

  if (positionCount % 10 === 0) {
    if (this.traktScrobble) {
      this.filesService
        .updateFile(this.uri, { position, duration: this.duration })
        .then(res => {
          const pos = position / this.duration * 100;

          if (!res.scrobble && pos !== Infinity && pos > 80) {
            this.addToHistory(this.uri, this.media);
          }
        });
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
  return this.trakt
    .addToHistory(media)
    .then(() => this.filesService.updateFile(filename, {
      scrobble: true,
      scrobbleAt: new Date().toISOString()
    }));
};

export default Player;

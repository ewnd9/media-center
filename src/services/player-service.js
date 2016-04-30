import proxy from '../utils/proxy';

function PlayerService() {
  if (process.env.NODE_ENV === 'production') {
    const player = require('../players/omx');

    this.startFs = proxy(player, player.default);
    this.startYoutube = player.startOmxPlayer;
  } else {
    this.startFs = require('../players/mock-player').default;
  }
}

PlayerService.prototype.play = function() {
  return this.startFs(arguments)
    .then(player => {
      this.player = player;
      return player;
    });
};

PlayerService.prototype.getInfo = function() {
  return this.player && this.player.getInfo() || { status: null };
};

export default PlayerService;

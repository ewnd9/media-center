function getPlayer() {
  if (process.env.PLAYER === 'vlc') {
    return require('../players/vlc').default;
  } else if (process.env.PLAYER === 'mock') {
    return require('../players/mock-player').default;
  } else {
    return require('../players/omx').default;
  }
}

export default function(trakt) {
  const PlayerService = getPlayer();
  return new PlayerService(trakt);
}

import mpris from 'mpris';
import storage, { PLAY_MEDIA, PAUSE_MEDIA } from './../storage';

export default (file) => {
  let duration = null;

  mpris.Player.on('MetadataChanged', (newValue, oldValue) => {
    duration = newValue['mpris:length'];
  });

  mpris.Player.on('PlaybackStatusChanged', function (newValue, oldValue) {
    mpris.Player.GetMetadata(function (error, metadata) {
      let status = newValue.toLowerCase();

      mpris.Player.GetPosition(function(err, data) {
        let position = data;
        let progress = position / duration * 100;

        if (status === 'playing') {
          storage.emit(PLAY_MEDIA, progress);
        } else if (status === 'paused') {
          storage.emit(PAUSE_MEDIA, progress);
        } else if (status === 'stopped') {
          storage.emit(PAUSE_MEDIA, progress);
        }
      });
    });
  });

  let args = [
  	// '-I', 'qt4',
  	'--control', 'dbus'
  ];

  mpris.start('vlc', args, (error) => {
    mpris.Player.OpenUri('file://' + file, (error) => {
      mpris.Player.Play((error) => {
        console.log('started');
      });
    });
  });
};

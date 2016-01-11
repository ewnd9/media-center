import Promise from 'bluebird';
import notifier from 'node-notifier';

import storage, {
	UPDATE_PLAYBACK,
  USER_PAUSE_MEDIA,
  USER_CLOSE
} from './../storage';

const notify = (message) => {
  notifier.notify({
    title: 'MOCK PLAYER',
    message
  });
};

export default (trakt, addToHistory, db, media, file, prevPosition) => {
  return Promise
    .resolve()
    .then(() => {
      let position = 0;
      let duration = 100 * 60 * 1000 * 1000; // 100 minutes
      let status = 'Playing';

      const getInfo = () => ({
        progress: position / duration * 100,
        position,
        duration,
        media,
        status
      });

      let loopInterval;

      const emitUpdate = () => storage.emit(UPDATE_PLAYBACK, getInfo());
      const emitClose = () => storage.emit(USER_CLOSE, getInfo());

			const pausePlaying = () => {
				if (loopInterval) {
					clearInterval(loopInterval);
				}
			};

      const startPlaying = () => {
				pausePlaying();

			  loopInterval = setInterval(() => {
          position = position + 1000 * 1000; // 1 second
          emitUpdate();
        }, 1000);
      };

			startPlaying();
			notify(`START PLAYING ${file} ${prevPosition ? 'from ' + prevPosition : ''}`);

      const onPause = () => {
        if (status === 'Playing') {
          status = 'Pause';
        } else {
          status = 'Playing';
					startPlaying();
        }

        notify(`NEW STATUS ${status}`);

        emitUpdate();
      };

      storage.on(USER_PAUSE_MEDIA, onPause);

      const onClose = () => {
        emitUpdate();
				emitClose();

        notify(`CLOSE MEDIA`);

        storage.removeListener(USER_PAUSE_MEDIA, onPause);
        storage.removeListener(USER_CLOSE, onClose);
      };

      storage.on(USER_CLOSE, onClose);

      return { getInfo };
    });
};

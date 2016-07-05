import test from 'ava';
import 'babel-register';

import createApp from '../fixtures/create-app';
import { showImdb } from '../fixtures/create-fs';
import createMarksServiceMock from '../fixtures/create-marks-service';

test('fetch and save subtitles', async t => {
  const { services, db } = await createApp({ marksServiceMock: createMarksServiceMock() });
  t.truthy((await db.Subtitles.findAll()).total_rows === 0);
  const subtitles0 = await services.marksService.getSubtitles(showImdb, 1, 1);
  t.truthy((await db.Subtitles.findAll()).total_rows === 1);
  const subtitles1 = await services.marksService.getSubtitles(showImdb, 1, 1);
  t.truthy((await db.Subtitles.findAll()).total_rows === 1);
  t.truthy(subtitles1.text.length > 0);
});

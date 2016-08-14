import mock from 'mock-fs';

export const testDir = '/home/pi/video';

export const showFolder = 'Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]';

export const showTitle = 'Master of None';
export const showImdb = 'tt4635276';

export const showFile1 = 'Master.of.None.S01E01.Plan.B.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv';
export const showFile2 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv';
export const showFile3 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.Sample.mkv';
export const showFile4 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.sample.mkv';

export const movieFolder = 'Minions 2015 1080p BluRay x264 AC3-JYK';
export const movieFile = 'Minions 2015 1080p BluRay x264 AC3-JYK.mkv';

export const movieTitle = 'Minions';

export const nearestDate = new Date(2);
export const pastDate = new Date(1);

const f = birthtime => mock.file({ content: '', birthtime });

export function mockFs() {
  mock({
    [testDir]: {
      [showFolder]: mock.directory({
        birthtime: pastDate,
        items: {
          [showFile1]: f(pastDate),
          [showFile2]: f(pastDate),
          [showFile3]: f(pastDate),
          [showFile4]: f(pastDate)
        }
      }),
      [movieFolder]: mock.directory({
        birthtime: nearestDate,
        items: {
          [movieFile]: f(nearestDate)
        }
      })
    }
  });
}

export function unmockFs() {
  mock.restore();
}

import test from 'ava';
import 'babel-core/register';
import mock from 'mock-fs';
import findFiles from './../src/find-files';
import createDb from './fixtures/create-db';

const testDir = '/home/pi/video';

const showFolder = 'Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]';

const showTitle = 'Master of None';
const showImdb = 'tt4635276';

const showFile1 = 'Master.of.None.S01E01.Plan.B.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv';
const showFile2 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv';
const showFile3 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.Sample.mkv';
const showFile4 = 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.sample.mkv';

const movieFolder = 'Minions 2015 1080p BluRay x264 AC3-JYK';
const movieFile = 'Minions 2015 1080p BluRay x264 AC3-JYK.mkv';

const movieTitle = 'Minions';

const nearestDate = new Date(2);
const pastDate = new Date(1);

test('#findFiles', async t => {
	const db = createDb();
	const res = await db.addFile([testDir, showFolder, showFile1].join('/'), {
		type: 'show',
		title: showTitle,
		s: 1,
		e: 1,
		imdb: showImdb
	});

	mock({
	  [testDir]: {
	    [showFolder]: mock.directory({
				birthtime: pastDate,
		    items: {
					[showFile1]: '',
					[showFile2]: '',
					[showFile3]: '',
					[showFile4]: ''
		    }
			}),
	    [movieFolder]: mock.directory({
				birthtime: nearestDate,
		    items: {
					[movieFile]: ''
		    }
			})
	  }
	});

	const result = await findFiles(db, testDir);

	t.is(result[0].birthtime, nearestDate);
	t.is(result[0].dir, [testDir, movieFolder].join('/'));
	t.is(result[0].file, [testDir, movieFolder, movieFile].join('/'));
	t.is(result[0].db, undefined);
	t.is(result[0].recognition.type, 'movie');
	t.is(result[0].recognition.title, movieTitle);
	t.is(result[0].recognition.year, 2015);

	t.is(result[1].dir, [testDir, showFolder].join('/'));
	t.is(result[1].birthtime, pastDate);

	const items = result[1].contents;

	t.is(items.length, 2);

	t.is(items[0].file, [testDir, showFolder, showFile1].join('/'));

	t.is(items[0].db.title, showTitle);
	t.is(items[0].db.imdb, showImdb);
	t.ok(items[0].db._id);

	t.is(items[0].recognition.type, 'show');
	t.ok(items[0].recognition.title === showTitle);
	t.is(items[0].recognition.s, 1);
	t.is(items[0].recognition.ep, 1);

	t.is(items[1].file, [testDir, showFolder, showFile2].join('/'));

	t.is(items[1].db.title, showTitle);
	t.is(items[1].db.imdb, showImdb);
	t.notOk(items[1].db._id);

	t.is(items[1].recognition.type, 'show');
	t.is(items[1].recognition.title, showTitle);
	t.is(items[1].recognition.s, 1);
	t.is(items[1].recognition.ep, 2);

	mock.restore();
});

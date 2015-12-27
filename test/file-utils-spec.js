import test from 'ava';
import 'babel-core/register';
import mock from 'mock-fs';

import findFiles from './../src/find-files';

const testDir = '/home/pi/video/';

test.before(() => {
	mock({
	  [testDir]: {
	    'Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]': mock.directory({
				birthtime: new Date(1),
		    items: {
					'Master.of.None.S01E01.Plan.B.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv': '',
					'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv': ''
		    }
			}),
	    'Minions 2015 1080p BluRay x264 AC3-JYK': mock.directory({
				birthtime: new Date(2),
		    items: {
					'Minions 2015 1080p BluRay x264 AC3-JYK.mkv': ''
		    }
			})
	  }
	});
});

test.after(() => {
	mock.restore();
});

test('file utils', async t => {
	const result = await findFiles(testDir);

	t.same(result, [
		{
			birthtime: new Date(2),
			dir: '/home/pi/video/Minions 2015 1080p BluRay x264 AC3-JYK',
			file: 'Minions 2015 1080p BluRay x264 AC3-JYK.mkv'
		},
		{
			dir: '/home/pi/video/Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]',
			birthtime: new Date(1),
			contents: [
				{
					dir: '/home/pi/video/Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]',
					file: 'Master.of.None.S01E01.Plan.B.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv'
				},
				{
					dir: '/home/pi/video/Master of None S01 Season 1 Complete 1080p WEB-DL [rartv]',
					file: 'Master.of.None.S01E02.Parents.1080p.NF.WEBRip.DD5.1.x264-NTb.mkv'
				}
			]
		}
	]);
});

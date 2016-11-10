import test from 'ava';

import { assertFilesSizes, formatModules, reduceModules } from '../src/libs/webpack-perfomance-budget';
import isCI from 'is-ci';
import { exec } from 'child_process';
import pify from 'pify';

test('webpack files don\'t exceed 200 kb', async t => {
  if (isCI) {
    await pify(exec)('npm run build:frontend', { cwd: __dirname + '/../' });
    const data = require('../stats.json');
    t.truthy(data);

    assertFilesSizes(data, `${__dirname}/../public`, [
      [/\.js$/, 200000], // 200kb
      [/\.js\.map$/, 2000000], // 2mb
      [/.*/, 200000] // 200kb
    ]);

    console.log(formatModules(reduceModules(data)));
  }
});

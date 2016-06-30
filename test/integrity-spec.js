import test from 'ava';
import 'babel-core/register';
import path from 'path';

import checkApiEndpoints from './helpers/express-routes-check';
import createApp from './fixtures/create-app';

test('every api endpoint has a correspoding test', async t => {
  const app = await createApp();
  const filesFilter = __dirname + '/**/*-spec.js';

  const result = checkApiEndpoints(app.app, filesFilter);

  if (result.length > 0) {
    throw new Error(`missing tests:\n${result.join('\n')}`)
  }
});

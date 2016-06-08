#!/usr/bin/env node

'use strict';

require('source-map-support').install();

const app = require('./lib/index');
const config = require('./lib/config');

const errorBoard = process.env.NODE_ENV === 'production' ? (
  require('embedded-error-board')(config.errorBoardPath, config.errorBoardMount)
) : null;

process.on('uncaughtException', function (err) {
  console.error('global exception:', err.stack || err);

  if (errorBoard) {
    errorBoard.agent.report(err);
  }
});

process.on('unhandledRejection', function (reason, promise) {
  console.error('unhandled promise rejection:', reason.stack || reason);

  if (errorBoard) {
    errorBoard.agent.report(reason);
  }
});

app.default(errorBoard);

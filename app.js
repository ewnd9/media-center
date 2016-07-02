#!/usr/bin/env node

'use strict';

require('source-map-support').install();

const report = require('./lib/agent').default;
const app = require('./lib/index');

process.on('uncaughtException', function (err) {
  console.error('global exception:', err.stack || err);
  report(err);
});

process.on('unhandledRejection', function (reason) {
  console.error('unhandled promise rejection:', reason.stack || reason);
  report(err);
});

app.default();

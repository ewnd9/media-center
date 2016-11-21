'use strict';

const path = require('path');
const { transform } = require('../webpack.config.prod');

const config = transform(require('./webpack.config'));
config.output.publicPath = process.env.PUBLIC_PATH || '/media-center/'; // gh-pages

module.exports = config;

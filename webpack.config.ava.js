'use strict';

const devConfig = require('./webpack.config');

const config = {
  output: {
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: devConfig.module.loaders
      .filter(loader => {
        return loader.loader.indexOf('style-loader') === 0;
      })
  }
};

module.exports = config;

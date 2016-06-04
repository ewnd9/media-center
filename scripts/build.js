'use strict';

const fs = require('fs');
const webpack = require('webpack');
const config = require('../webpack.config.prod');
const simpleStats = require('./simple-stats');

config.profile = true;

webpack(config, function(err, stats) {
  const assets = stats.compilation.assets;
  const files = Object.keys(assets)
    .map(file => {
      const result = {
        name: file,
        size: assets[file].size()
      };

      if (typeof result.size === 'object') {
        result.size = result.size.size;
      }

      return result;
    });

  const content = simpleStats.formatFiles(files, './public');
  simpleStats.updateMarkdown('./README.md', content);
  console.log(content);
});

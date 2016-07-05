'use strict';

// NODE_ENV=production node_modules/.bin/webpack --config webpack.config.prod.js --json | node webpack-bundle-size

const _ = require('lodash');
const prettyBytes = require('pretty-bytes');
const simpleStats = require('./simple-stats');

module.exports = function(data) {
  printChunks(data);
  printModules(data);
};

function printModules(data) {
  const groupsByChunk = _.groupBy(data.modules, m => {
    if (m.chunks.length === 0) {
      return 'undefined';
    } else {
      return m.chunks[0];
    }
  });

  Object
    .keys(groupsByChunk)
    .forEach(chunk => {
      const chunkName = data.chunks[chunk] && data.chunks[chunk].names[0] || chunk;
      const groupsByLocation = _.groupBy(groupsByChunk[chunk], m => {
        return m.name.indexOf('./~/') === 0 ? './~/' : './';
      });

      Object
        .keys(groupsByLocation)
        .forEach(prefix => {
          let totalSize = 0;
          const appModules = _.sortBy(groupsByLocation[prefix], m => m.size);
          const xs = [];

          appModules.reverse().slice(0, 10).forEach(m => {
            xs.push(`${m.name} - ${prettyBytes(m.size)}`);
            totalSize += m.size;
          });

          console.log(`chunk: ${chunkName}, prefix "${prefix}", ${appModules.length} modules: total size - ${prettyBytes(totalSize)}\n`);
          console.log(`Top 10 by size:\n${xs.join('\n')}\n`);
        });
    });
}

function printChunks(data) {
  const assets = data.assets;
  const files = data.assets
    .map(asset => {
      const result = {
        name: asset.name,
        size: asset.size
      };

      return result;
    });

  const content = simpleStats.formatFiles(files, './public');
  console.log(content);
}

if (!module.parent) {
  let data = '';

  process.stdin.on('data', _data => {
    data += _data;
  });

  process.stdin.on('end', () => {
    module.exports(JSON.parse(data));
  });

  // const data = require('../1.json');
  // module.exports(data);
}

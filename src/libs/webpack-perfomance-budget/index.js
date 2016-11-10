'use strict';

const groupBy = require('lodash/groupBy');
const sortBy = require('lodash/sortBy');

const fs = require('fs');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');
const pluralize = require('pluralize');

exports.reduceFiles = reduceFiles;
exports.assertFilesSizes = assertFilesSizes;

exports.reduceModules = reduceModules;
exports.formatModules = formatModules;

function reduceFiles(data, distDir) {
  const files = data.assets
    .reduce(
      (result, asset) => {
        const file = fs.readFileSync(path.resolve(distDir, asset.name));

        const size = asset.size.size || asset.size;
        const prettySize = prettyBytes(size);
        const gzip = gzipSize.sync(file);
        const prettyGzip = prettyBytes(gzip);

        const ext = asset.name.split('.').slice(1).join('.');

        const ret = {
          name: asset.name,
          ext,
          size,
          gzip,
          prettySize,
          prettyGzip
        };

        result[ext] = result[ext] || [];
        result[ext].push(ret);

        return result;
      },
      {}
    );

  return files;
}

function assertFilesSizes(data, distDir, limits) {
  const files = reduceFiles(data, distDir);

  for (const ext in files) {
    for (const file of files[ext]) {
      const limit = limits.find(limit => file.name.match(limit[0]));

      if (!limit) {
        throw new Error(`"${file.name}" doesn\'t match any of regexps`);
      }

      if (file.gzip > limit[1]) {
        throw new Error(`"${file.name}" (${file.prettyGzip}) exceeds a limit for "${limit[0]}" (${prettyBytes(limit[1])})`);
      }
    }
  }
}

function reduceModules(data) {
  const groupsByChunk = groupBy(data.modules, m => {
    if (m.chunks.length === 0) {
      return 'undefined';
    } else {
      return m.chunks[0];
    }
  });

  return Object
    .keys(groupsByChunk)
    .reduce((result, chunk) => {
      const chunkName = data.chunks[chunk] && data.chunks[chunk].names[0] || chunk;
      const groupsByLocation = groupBy(groupsByChunk[chunk], m => {
        return m.name.indexOf('./~/') === 0 ? 'dependencies' : 'app';
      });

      const groups = Object
        .keys(groupsByLocation)
        .map(prefix => {
          let totalSize = 0;

          const appModules = sortBy(groupsByLocation[prefix], m => m.size);
          const xs = [];

          appModules.reverse().forEach(m => {
            xs.push({
              name: m.name,
              size: prettyBytes(m.size)
            });

            totalSize += m.size;
          });

          return {
            prefix,
            count: appModules.length,
            size: prettyBytes(totalSize),
            modules: xs
          };
        });

      result[chunkName] = result[chunkName] || { name: chunkName, groups };
      return result;
    }, {});
}

function formatModules(data) {
  let result = '';

  for (const chunk in data) {
    result += `chunk "${chunk}":\n\n`;

    for (const group of data[chunk].groups) {
      result += `${group.modules.length} ${pluralize('module', group.modules.length)}\n\n`;

      for (const mod of group.modules.slice(0, 10)) {
        result += `  ${mod.name} ${mod.size}\n`;
      }

      result += `\n`;
    }
  }

  return result;
}
